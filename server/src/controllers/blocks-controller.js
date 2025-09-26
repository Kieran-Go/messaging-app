import prisma from '../../db/pool.js';
import newError from '../util/newError.js';

export default {
    // ----- GET -----
    getBlocks: async (userId) => {
        return await prisma.block.findMany({
            where: { blockerId: userId },
            select: {
                id: true,
                createdAt: true,
                blocked: {
                    select: {
                        id: true,
                        username: true,
                        lastSeen: true
                    }
                }
            }
        });
    },

    // ----- CREATE -----
    createBlock: async(blockerId, blockedId) => {
        // Delete existing friendship if any
        await prisma.friendship.deleteMany({
            where: {
                OR: [
                    { requesterId: blockerId, receiverId: blockedId },
                    { requesterId: blockedId, receiverId: blockerId }
                ]
            }
        });
        
        return await prisma.block.create({
            data: { blockerId, blockedId }
        });
    },

    // -- DELETE -----
    deleteBlock: async (blockerId, blockedId) => {
        const block = await prisma.block.findFirst({ where: { blockerId, blockedId } });
        if (!block) throw newError("Block not found", 404);
        return await prisma.block.delete({ where: { id: block.id } });
    }
}