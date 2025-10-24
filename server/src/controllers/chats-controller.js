import prisma from '../../db/pool.js';
import newError from '../util/newError.js';

// Helper function for getting and formatting an individual chat
async function hydrateChat(id, userId) {
    const [, chat] = await prisma.$transaction([
        // First, reset the unread count for the user
        prisma.chatMember.update({
            where: { chatId_userId: { chatId: id, userId } },
            data: { unreadCount: 0 }
        }),

        // Find the unique chat
        prisma.chat.findUnique({
            where: { id },
            include: {
                // Include all members
                members: {
                    include: {
                        user: { select: { id: true, username: true, lastSeen: true } },
                    },
                },
                // Include all messages in order of last sent at
                messages: {
                    orderBy: { sentAt: 'asc' },
                    include: {
                        user: { select: { id: true, username: true } },
                    },
                },
            },
        })
    ]);

    if (!chat) throw newError("Chat not found", 404);
    return chat;
}


export default {
    // ----- GET -----
    // Get a single chat
    getChat: async (id, userId) => {
        return await hydrateChat(id, userId);
    },

    // Get a list of all chats that a user is a member of
    getUserChats: async (userId) => {
        return await prisma.chat.findMany({
            where: {
                members: {
                    some: {
                        userId: userId, 
                        hidden: false // Exclude chats the user has hidden
                    }
                }
            },
            include: {
                // GET all members of each chat
                members: {
                    select: {
                        user: {
                            select: { id: true, username: true, lastSeen: true }
                        },
                        unreadCount: true
                    }
                },
                // GET last message of each chat for a preview
                messages: {
                    take: 1,
                    orderBy: { sentAt: "desc" },
                    include: {
                        user: { select: { id: true, username: true } },
                    },
                },
            },
            // Order chats by latest activity
            orderBy: { updatedAt: "desc" }
        });
    },

    // ----- POST ------
    createChat: async (name, memberIds) => {
        // Check for uniqueness if it's a 1:1 DM
        if (memberIds.length === 2) {
            // Get a list of all chats where the two users are members
            const potentialChats = await prisma.chat.findMany({
                where: {
                    AND: [
                        { members: { some: { userId: memberIds[0] } } },
                        { members: { some: { userId: memberIds[1] } } },
                    ]
                },
                include: { members: true },
            });

            // Filter the chats to find the one that ONLY contains the two users
            const existingChat = potentialChats.find(
                chat => chat.members.length === 2
            );

            // If the private DM between the two users exists, get that instead
            if (existingChat) return await hydrateChat(existingChat.id, memberIds[0]);
        }


        // Otherwise, create a new chat
        const chat = await prisma.chat.create({
            data: {
                name: name || null, // Optional name
                isGroup: memberIds.length > 2, // Mark as group if more than two members
                // Map using the array of member IDs
                members: {
                    create: memberIds.map((userId) => ({
                        user: { connect: { id: userId }}
                    })),
                }
            },
        });
        return hydrateChat(chat.id, memberIds[0]);
    },

    // Create a new member for an existing group-chat
    createChatMember: async(chatId, userId) => {
        // Prevent adding a new chat member if chat is not a group
        const chat = await prisma.chat.findUnique({ where: { id: chatId }});
        if(!chat.isGroup) throw newError("Cannot add new user to a private DM", 400);

        return await prisma.chatMember.create({
            data: { chatId, userId }
        });
    },

    createChatMessage: async (chatId, userId, content) => {
        // Fetch chat and its members
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: { members: true }
        });

        if(chat.members.length <= 1) throw newError("You are the only user in this chat");

        // If the chat is not a group, check if either user has blocked the other
        if (!chat.isGroup) {
            const otherMember = chat.members.find(m => m.userId !== userId);

            const blocked = await prisma.block.findFirst({
                where: {
                    OR: [
                        { blockerId: userId, blockedId: otherMember.userId },
                        { blockerId: otherMember.userId, blockedId: userId }
                    ]
                }
            });
            if (blocked) throw newError("Cannot send messages to this user");
        }

        // Proceed with transaction
        const [message] = await prisma.$transaction([
            prisma.message.create({
                data: { chatId, userId, content },
                include: { user: { select: { id: true, username: true } } },
            }),
            prisma.chat.update({
                where: { id: chatId },
                data: { updatedAt: new Date() }
            }),
            prisma.chatMember.updateMany({
                where: { chatId, userId: { not: userId } },
                data: { unreadCount: { increment: 1 }, hidden: false }
            })
        ]);

        return message;
    },


    // ----- PUT -----
    // Change name of a chat
    changeChatName: async (id, newName) => {
        return await prisma.chat.update({
            where: { id },
            data: { name: newName }
        });
    },

    // Handle removing a user from a chat
    leaveChat: async(id, userId) => {
        const chat = await prisma.chat.findUnique({
            where: { id }, include: { members: true }
        });

        if(!chat) throw newError("Chat not found", 404);

        // If chat is a group, fully remove user from chat
        if(chat.isGroup) {
            return await prisma.chatMember.delete({
                where: { chatId_userId: { chatId: id, userId }}
            });
        }

        // If not a group-chat, just hide it from the user instead of removing them
        else {
            return await prisma.chatMember.update({
                where: { chatId_userId: { chatId: id, userId }},
                data: { hidden: true }
            });
        }
    },

    // Unhide a user's hidden chat
    unhideChat: async(id, userId) => {
        const chat = await prisma.chat.findUnique({
            where: { id }, include: { members: true }
        });

        if(!chat) throw newError("Chat not found", 404);

        return await prisma.chatMember.update({
            where: { chatId_userId: { chatId: id, userId }},
            data: { hidden: false }
        });
    },

    // Edit a chat message
   editChatMessage: async (messageId, userId, newContent) => {
        // Only allow editing by the message author
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message) throw newError("Message not found", 404);
        if (message.userId !== userId) throw newError("Not authorized to edit this message", 403);

        return await prisma.message.update({
            where: { id: messageId },
            data: { content: newContent },
        });
    },

    // ----- DELETE -----
    deleteChatMessage: async (messageId, userId) => {
        // Only allow deleting by the message author
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message) throw newError("Message not found", 404);
        if (message.userId !== userId) throw newError("Not authorized to delete this message", 403);

        return await prisma.message.delete({
            where: { id: messageId },
        });
    },
}