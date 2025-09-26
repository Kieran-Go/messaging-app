import { Router } from "express";
import controller from "../controllers/friendships-controller.js";
import newError from "../util/newError.js";
import validator from "../validation/friendshipsValidator.js";

// Initialize router
const router = Router();

// ----- GET -----
router.get('/:userId', validator.userId, async(req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const friendships = await controller.getFriendships(userId);
        res.json(friendships);
    }
    catch(err) {
        next(err);
    }
});

// ----- POST -----
router.post('/:userId', validator.createFriendship, async(req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const { receiverId } = req.body;
        if(userId === receiverId) throw newError("Cannot send friend request to yourself", 400);

        const newFriend = await controller.createFriendship(userId, receiverId);
        res.json(newFriend);
    }
    catch(err) {
        next(err);
    }
});

// ----- PUT -----
router.put('/:userId/:id', validator.userId, validator.friendshipId, async(req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const id = parseInt(req.params.id, 10);
        const acceptedFriendship = await controller.acceptFriendship(id, userId);
        res.json(acceptedFriendship);
    }
    catch(err) {
        next(err);
    }
});

// ----- DELETE -----
router.delete('/:id', validator.friendshipId, async(req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const deletedFriendship = await controller.deleteFriendship(id);
        res.json(deletedFriendship);
    }
    catch(err) {
        next(err);
    }
});

export default router;