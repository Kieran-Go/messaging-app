import prisma from '../../db/pool.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import newError from '../util/newError.js';

const SALT = parseInt(process.env.SALT_ROUNDS) || 10;

// Helper function for finding a user and comparing passwords
const verifyUser = async (id, password) => {
    // Find user
    const user = await prisma.user.findUnique({
        where: { id },
        select: { username: true, password: true, lastSeen: true }
    });

    // Compare hashed password and throw error if no match
    const passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch) throw newError("Incorrect password", 401);

    // Return user
    return user;
}

export default {
    // ----- GET -----
    getUser: async (id) => {
        return await prisma.user.findUnique({
            where: { id },
            select: { id: true, username: true, lastSeen: true }
        });
    },

    searchUsers: async (id, filter = null) => {
        // Base where
        const where = { NOT: { id } };

        // Add AND condition to where if filter provided
        if (filter) {
            where.AND = [
                { username: { contains: filter, mode: 'insensitive' } }
            ];
        }

        return await prisma.user.findMany({
            where,
            select: { id: true, username: true, lastSeen: true },
            orderBy: { username: 'asc' }
        });
    },


    // ----- POST -----
    createUser: async (username, password) => {
        const hash = await bcrypt.hash(password, SALT);
        return prisma.user.create({
            data: { username, password: hash }
        });
    },

    // ----- PUT -----
    editUsername: async (id, username, password) => {
        // Verify user
        await verifyUser(id, password);

        // Edit user's username
        return await prisma.user.update({
            where: { id },
            data: { username }
        });
    },

    editUserPassword: async (id, password, newPassword) => {
        // Verify user
        await verifyUser(id, password);

        // Hash new password
        const hash = await bcrypt.hash(newPassword, SALT);

        // Update user's password
        return await prisma.user.update({
            where: { id },
            data: { password: hash }
        });
    },

    // ----- DELETE -----
    deleteUser: async (id, password) => {
        // Verify user
        await verifyUser(id, password);

        // Delete the user
        return await prisma.user.delete({ where: { id }});
    },
}