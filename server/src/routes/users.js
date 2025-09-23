import { Router } from "express";
import controller from "../controllers/users-controller.js";
import newError from "../util/newError.js";

// Initialize router
const router = Router();

// ----- GET -----
// Get user by id
router.get('/:id', async (req, res, next) => {
    try{
        const id = parseInt(req.params.id, 10);
        if(isNaN(id)) throw newError("Invalid user id", 400);

        const user = await controller.getUser(id);
        if(!user) throw newError("User not found", 404);

        res.json(user);
    }
    catch(err) {
        next(err);
    }
});

// Search for users
router.get('/:id/search', async (req, res, next) => {
    try{
        const id = parseInt(req.params.id, 10);
        if(isNaN(id)) throw newError("Invalid user id", 400);

        const filter = req.query.filter || null;

        const searchedUsers = await controller.searchUsers(id, filter);
        if (!searchedUsers.length) return res.json({ message: "No users found", users: [] });
        res.json({ users: searchedUsers });
        
    }
    catch(err) {
        next(err);
    }
});

// ----- POST -----
// Create new user
router.post('/', async (req, res, next) => {
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
router.put('/:id', async (req, res, next) => {
    try{
        const id = parseInt(req.params.id, 10);
        if(isNaN(id)) throw newError("Invalid user id", 400);

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
router.delete('/:id', async (req, res, next) => {
    try{
        const id = parseInt(req.params.id, 10);
        if(isNaN(id)) throw newError("Invalid user id", 400);

        const deletedUser = await controller.deleteUser(id);
        res.json(deletedUser);        
    }
    catch(err) {
        next(err);
    }
});

export default router;