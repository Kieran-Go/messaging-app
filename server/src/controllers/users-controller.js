import prisma from '../../db/pool.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const SALT = parseInt(process.env.SALT_ROUNDS) || 10;

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
    editUser: async (id, username = null, password = null, lastSeen = null) => {
        const data = {};
        if(username) data.username = username;
        if (password) {
            const hash = await bcrypt.hash(password, SALT);
            data.password = hash;
        }
        if(lastSeen) data.lastSeen = lastSeen;

        return await prisma.user.update({
            where: { id },
            data
        });
    },

    // ----- DELETE -----
    deleteUser: async (id) => {
        return await prisma.user.delete({ where: { id }});
    },
}