import { Router } from "express";
import controller from "../controllers/blocks-controller.js";
import newError from "../util/newError.js";
import validator from "../validation/blocksValidator.js";

// Initialize router
const router = Router();

// ----- GET -----
router.get('/:userId', validator.userId, async(req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const blocks = await controller.getBlocks(userId);
        res.json(blocks);
    }
    catch(err) {
        next(err);
    }
});

// ----- POST ----- 
router.post('/:userId/:blockedId', validator.userId, validator.blockedId, async(req, res, next) => {
    try {
        const blockerId = parseInt(req.params.userId, 10);
        const blockedId = parseInt(req.params.blockedId, 10);
        if(blockerId === blockedId) throw newError("Cannot block yourself", 400);
        
        const block = await controller.createBlock(blockerId, blockedId);
        res.json(block);
    }
    catch (err) {
        next(err);
    }
});

// ----- DELETE -----
router.delete('/:userId/:blockedId', validator.userId, validator.blockedId, async (req, res, next) => {
    try {
        const blockerId = parseInt(req.params.userId, 10);
        const blockedId = parseInt(req.params.blockedId, 10);
        if(blockerId === blockedId) throw newError("Cannot unblock yourself", 400);

        const block = await controller.deleteBlock(blockerId, blockedId);
        res.json(block);
    } 
    catch (err) {
        next(err);
    }
});

export default router;