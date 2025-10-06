import prisma from '../../db/pool.js';
import newError from '../util/newError.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const SALT = parseInt(process.env.SALT_ROUNDS) || 10;

export default {
    getUser: async (id) => {
        return await prisma.user.findUnique({
            where: { id },
            select: { id: true, username: true } 
        });
    },

    getLoginRequest: async (username, password) => {
        // Find user by username
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true, username: true, password: true }
        });

        if (!user) return null;

        // Compare hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch) return null;

        return { id: user.id, username: user.username };
    },

    signUpUser: async (username, password) => {
        // Check that a user with this username doesn't already exist
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });
        if(existingUser) throw newError("A user with this name already exists", 400);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT);

        // Create and return the new user
        const user = await prisma.user.create({
            data: { username, password: hashedPassword }
        });
        return { id: user.id, username: user.username };
    }
}