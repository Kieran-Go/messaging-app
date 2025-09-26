import prisma from '../../db/pool.js';
import newError from '../util/newError.js';

export default {
    // ----- GET -----
    getFriendships: async (userId) => {
        // Get friendships where userId is equal to requesterId OR receiverId
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                requester: true,
                receiver: true
            }
        });
        // Map friendships so only the friends of the user are returned
        return friendships.map(f => {
            const friend = f.requesterId === userId ? f.receiver : f.requester;
            return {
                id: f.id,
                friend,
                accepted: f.accepted,
                createdAt: f.createdAt,
                isRequester: f.requesterId === userId
            }
        });
    },

    // ----- POST -----
    createFriendship: async (requesterId, receiverId) => {
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