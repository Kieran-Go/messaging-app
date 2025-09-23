import { Router } from "express";
import controller from "../controllers/users-controller.js";

// Initialize router
const router = Router();

// ----- GET -----
// Get all users (admin only)
router.get('/', async (req, res, next) => {
    try{
        const users = await controller.getAllUsers();
        res.json(users);
    }
    catch(err) {
        next(err);
    }
});

export default router;