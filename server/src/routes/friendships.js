import { Router } from "express";
import controller from "../controllers/friendships-controller.js";
import newError from "../util/newError.js";
import val from "../validation/friendshipsValidator.js";
import verifyToken from "../middleware/verifyToken.js";

// Initialize router
const router = Router();

// ----- GET -----
router.get('/', verifyToken, async(req, res, next) => {
    try {
        const { id } = req.user;
        const friendships = await controller.getFriendships(id);
        res.json(friendships);
    }
    catch(err) {
        next(err);
    }
});

// ----- POST -----
router.post('/', verifyToken, val.receiverId, async(req, res, next) => {
    try {
        const { id } = req.user;
        const { receiverId } = req.body;
        if(id === receiverId) throw newError("Cannot send friend request to yourself", 400);

        const newFriend = await controller.createFriendship(id, receiverId);
        res.json(newFriend);
    }
    catch(err) {
        next(err);
    }
});

// ----- PUT -----
router.put('/:friendshipId', verifyToken, val.friendshipId, async(req, res, next) => {
    try {
        const { id } = req.user;
        const friendshipId = parseInt(req.params.friendshipId, 10);
        const acceptedFriendship = await controller.acceptFriendship(friendshipId, id);
        res.json(acceptedFriendship);
    }
    catch(err) {
        next(err);
    }
});

// ----- DELETE -----
router.delete('/:friendshipId', verifyToken, val.friendshipId, async(req, res, next) => {
    try {
        const friendshipId = parseInt(req.params.friendshipId, 10);
        const deletedFriendship = await controller.deleteFriendship(friendshipId);
        res.json(deletedFriendship);
    }
    catch(err) {
        next(err);
    }
});

export default router;