import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import controller from "../controllers/auth-controller.js";
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import newError from '../util/newError.js';
import val from "../validation/usersValidator.js";

const router = Router();

router.get('/', verifyToken, async (req, res, next) => {
    try{
        // The verifyToken middleware adds the decoded JWT payload to req.user. The payload should contain the user's ID
        const { id } = req.user;

        // Find the user in the database using the ID from the token
        const user = await controller.getUser(id);

        // If the user doesn't exist (e.g., was deleted after token was issued), return an error
        if (!user) throw newError("User not found", 404);

        // User exists and token is valid - return the user's public info
        res.json({ valid: true, user });
    }
    catch(err) {
        next(err);
    }
});

router.post('/login', val.username, val.password, async (req, res, next) => {
    try{
        // User inputed name and password
        const { username, password } = req.body;

        // Check the database for user
        const user = await controller.getLoginRequest(username, password);
        
        // Verify user
        if(!user) throw newError("Incorrect username or password", 400);
        
        // Payload to encode in the JWT
        const payload = { id: user.id };

        // Sign the JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        // Send token and user as json. Omit password and other sensitive data
        res.json({ token, user: { id: user.id, username: user.username } });
    }
    catch(err) {
        next(err);
    }
});

router.post('/signup', val.username, val.password, async (req, res, next) => {
    try {
        // User inputed name and password
        const { username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            throw newError("Passwords do not match", 400);
        }

        // Create new user
        const user = await controller.signUpUser(username, password);

        // Payload to encode in the JWT
        const payload = { id: user.id };

        // Sign the JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        // Send token and user as json. Omit password and other sensitive data
        res.json({ token, user: { id: user.id, username: user.username } });
    }
    catch(err) {
        next(err);
    }
});

export default router;