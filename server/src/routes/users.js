import { Router } from "express";
import controller from "../controllers/users-controller.js";
import newError from "../util/newError.js";
import validator from "../validation/usersValidator.js";

// Initialize router
const router = Router();

// ----- GET -----
// Search for users
router.get('/:id/search', validator.userId, async (req, res, next) => {
    try{
        const id = parseInt(req.params.id, 10);

        const filter = req.query.filter || null;

        const searchedUsers = await controller.searchUsers(id, filter);
        if (!searchedUsers.length) return res.json({ message: "No users found", users: [] });
        res.json({ users: searchedUsers });
        
    }
    catch(err) {
        next(err);
    }
});

// Get user by id
router.get('/:id', validator.userId, async (req, res, next) => {
    try{
        const id = parseInt(req.params.id, 10);

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
router.post('/', validator.createUser, async (req, res, next) => {
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
router.put('/:id', validator.editUser, async (req, res, next) => {
    try{
        const id = parseInt(req.params.id, 10);
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
router.delete('/:id', validator.userId, async (req, res, next) => {
    try{
        const id = parseInt(req.params.id, 10);

        const deletedUser = await controller.deleteUser(id);
        res.json(deletedUser);        
    }
    catch(err) {
        next(err);
    }
});

export default router;