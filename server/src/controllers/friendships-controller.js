import prisma from '../../db/pool.js';
import newError from '../util/newError.js';

export default {
    // ----- GET -----
    getFriendships: async (userId) => {
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: userId },
                    { receiverId: userId }
                ]
            },
            select: {
                id: true,
                accepted: true,
                createdAt: true,
                requesterId: true,
                receiverId: true,
                requester: {
                    select: {
                        id: true,
                        username: true,
                        lastSeen: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        lastSeen: true
                    }
                }
            }
        });

        return friendships.map(f => {
            const friend = f.requesterId === userId ? f.receiver : f.requester;
            return {
                id: f.id,
                friend,
                accepted: f.accepted,
                createdAt: f.createdAt,
                isRequester: f.requesterId === userId
            };
        });
    },


    // ----- POST -----
    createFriendship: async (requesterId, receiverId) => {
        // Check if block exists
        const block = await prisma.block.findFirst({
            where: {
                OR: [
                    { blockerId: requesterId, blockedId: receiverId },
                    { blockerId: receiverId, blockedId: requesterId }
                ]
            }
        });
        if(block) throw newError("Cannot add friend while blocked", 403);

        return await prisma.friendship.create({
            data: { requesterId, receiverId, }
        });
    },

    // ----- PUT -----
    acceptFriendship: async (id, userId) => {
        try {
            return await prisma.friendship.update({
                where: { id, receiverId: userId },
                data: { accepted: true }
            });
        }
        // Prevent requesters from accepting the request themselves
        catch (err) {
            if(err.code === 'P2025') {
                throw newError("You are not authorized to accept this request", 403);
            }
            throw err;
        }
    },

    // ----- DELETE -----
    deleteFriendship: async (id) => {
        return await prisma.friendship.delete({
            where: { id }
        });
    }
}