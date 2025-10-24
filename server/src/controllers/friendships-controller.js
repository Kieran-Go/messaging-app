import prisma from '../../db/pool.js';
import newError from '../util/newError.js';

const friendshipExists = async (id) => {
    return await prisma.friendship.findUnique({
        where: { id },
    });
}

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

        // Check that a friendship between the two users does not already exist
        const friendshipExists = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId, receiverId },
                    { requesterId: receiverId, receiverId: requesterId }
                ]
            }
        });
        if(friendshipExists) throw newError("This user has already sent you a request!", 400);

        // Create the friendship
        const created = await prisma.friendship.create({
            data: { requesterId, receiverId },
            include: {
                requester: { select: { id: true, username: true, lastSeen: true } },
                receiver: { select: { id: true, username: true, lastSeen: true } },
            },
        });

        // Return normalized friendship object
        const friend = created.requesterId === requesterId ? created.receiver : created.requester;
        return {
            id: created.id,
            friend,
            accepted: created.accepted,
            createdAt: created.createdAt,
            isRequester: true
        };
    },

    // ----- PUT -----
    acceptFriendship: async (id, userId) => {
        // Check that the friend request exists
        const request = await friendshipExists(id);
        if (!request) throw newError("Friend request not found", 404);

        // Ensure the current user is the receiver
        if (request.receiverId !== userId)
            throw newError("You are not authorized to accept this request", 403);

        // Accept the request
        return await prisma.friendship.update({
            where: { id },
            data: { accepted: true },
        });
    },


    // ----- DELETE -----
    deleteFriendship: async (id) => {
        // Check that the friend request exists
        const request = await friendshipExists(id);
        if (!request) throw newError("Friend request not found", 404);

        // Delete friendship
        return await prisma.friendship.delete({
            where: { id }
        });
    }
}