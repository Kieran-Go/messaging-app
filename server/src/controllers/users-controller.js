import prisma from '../../db/pool.js';
import bcrypt from 'bcrypt'
import 'dotenv/config';

const SALT = parseInt(process.env.SALT_ROUNDS) || 10;

export default {
    getAllUsers: async () => {
        return 'Test';
    },
}