// Import routes here
import auth from './routes/auth.js';
import users from './routes/users.js';
import friendships from './routes/friendships.js';
import blocks from './routes/blocks.js';
import chats from './routes/chats.js';

// Export routes as object
export default {
    auth,
    users,
    friendships,
    blocks,
    chats,
}