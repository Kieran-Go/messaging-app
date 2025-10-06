import { Router } from "express";
import controller from "../controllers/blocks-controller.js";
import newError from "../util/newError.js";
import val from "../validation/blocksValidator.js";
import verifyToken from "../middleware/verifyToken.js";

// Initialize router
const router = Router();

// ----- GET -----
router.get('/', verifyToken, async(req, res, next) => {
    try {
        const { id } = req.user;
        const blocks = await controller.getBlocks(id);
        res.json(blocks);
    }
    catch(err) {
        next(err);
    }
});

// ----- POST ----- 
router.post('/:blockedId', verifyToken, val.blockedId, async(req, res, next) => {
    try {
        const { id } = req.user;
        const blockedId = parseInt(req.params.blockedId, 10);
        if(id === blockedId) throw newError("Cannot block yourself", 400);
        
        const block = await controller.createBlock(id, blockedId);
        res.json(block);
    }
    catch (err) {
        next(err);
    }
});

// ----- DELETE -----
router.delete('/:blockedId', verifyToken, val.blockedId, async (req, res, next) => {
    try {
        const { id } = req.user;
        const blockedId = parseInt(req.params.blockedId, 10);
        if(id === blockedId) throw newError("Cannot unblock yourself", 400);

        const block = await controller.deleteBlock(id, blockedId);
        res.json(block);
    } 
    catch (err) {
        next(err);
    }
});

export default router;