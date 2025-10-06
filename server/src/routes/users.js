import { Router } from "express";
import controller from "../controllers/users-controller.js";
import newError from "../util/newError.js";
import val from "../validation/usersValidator.js";
import verifyToken from "../middleware/verifyToken.js";

// Initialize router
const router = Router();

// ----- GET -----
// Search for users (excluding logged in user)
router.get('/search', verifyToken, async (req, res, next) => {
    try{
        const { id } = req.user;

        const filter = req.query.filter || null;

        const searchedUsers = await controller.searchUsers(id, filter);
        if (!searchedUsers.length) return res.json({ message: "No users found", users: [] });
        res.json({ users: searchedUsers });
        
    }
    catch(err) {
        next(err);
    }
});

// Get logged in user
router.get('/me', verifyToken, async (req, res, next) => {
    try{
        const { id } = req.user;

        const user = await controller.getUser(id);
        if(!user) throw newError("User not found", 404);

        res.json(user);
    }
    catch(err) {
        next(err);
    }
});

// ----- POST -----
// Create new user
router.post('/', val.username, val.password, async (req, res, next) => {
    try{
        const { username, password, confirmPassword } = req.body;
        if(password !== confirmPassword) throw newError("Passwords do not match", 400);

        const newUser = await controller.createUser(username, password);
        res.json(newUser);        
    }
    catch(err) {
        next(err);
    }
});

// ----- PUT -----
// Update existing user
router.put('/', verifyToken, val.editUser, async (req, res, next) => {
    try{
        const { id } = req.user;
        const { username = null, password = null, lastSeen = null } = req.body || {};

        const editedUser = await controller.editUser(id, username, password, lastSeen);
        res.json(editedUser);        
    }
    catch(err) {
        next(err);
    }
});

// ----- DELETE -----
// Delete user
router.delete('/', verifyToken, async (req, res, next) => {
    try{
        const { id } = req.user;

        const deletedUser = await controller.deleteUser(id);
        res.json(deletedUser);        
    }
    catch(err) {
        next(err);
    }
});

export default router;