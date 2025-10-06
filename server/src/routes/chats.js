import { Router } from "express";
import controller from "../controllers/chats-controller.js";
import newError from "../util/newError.js";
import val from "../validation/chatsValidator.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

// ----- GET -----
// Get an entire chat
router.get('/:chatId', verifyToken, val.chatId, async (req, res, next) => {
    try{
        const chatId = parseInt(req.params.chatId, 10);
        const { id } = req.user;
        const chat = await controller.getChat(chatId, id);
        res.json(chat);
    }
    catch(err){
        next(err);
    }
});

// Get list of a user's chats
router.get('/', verifyToken, async (req, res, next) => {
    try{
        const { id } = req.user;
        const chats = await controller.getUserChats(id);
        res.json(chats);
    }
    catch(err) {
        next(err);
    }
});

// ----- POST -----
// Create chat
router.post('/', verifyToken, val.memberIds, async (req, res, next) => {
    try {
        // Get the chat name and Ids from request body
        const { id } = req.user;
        const { name, memberIds = [] } = req.body;

        // Add the user's id to the start of the array
        const members = [id, ...memberIds];

        // Throw error if list of members exceeds limit
        if(members.length > 20) throw newError("Max members in a chat: 20", 400);

        // Create the new chat
        const chat = await controller.createChat(name || null, members);
        res.json(chat);
    }
    catch (err) {
        next(err);
    }
});

// Create chat member
router.post('/:chatId/members', verifyToken, val.chatId, async (req, res, next) => {
    try {
        const chatId = parseInt(req.params.chatId, 10);
        const { id } = req.user;

        const chatMember = await controller.createChatMember(chatId, id);
        res.json(chatMember);
    }
    catch (err) {
        next(err);
    }
});

// Create chat message
router.post('/:chatId/messages', verifyToken, val.chatId, val.content,
     async (req, res, next) => {
    try {
        const chatId = parseInt(req.params.chatId, 10);
        const { id } = req.user;
        const { content } = req.body;

        const chatMessage = await controller.createChatMessage(chatId, id, content);
        res.json(chatMessage);
    }
    catch (err) {
        next(err);
    }
});

// ----- PUT -----
// Change chat name
router.put('/:chatId', verifyToken, val.chatId, val.chatName, async(req, res, next) => {
    try{
        const chatId = parseInt(req.params.chatId, 10);
        const { name } = req.body;
        const chat = await controller.changeChatName(chatId, name);
        res.json(chat);
    }
    catch (err) {
        next(err);
    }
});

// Leave chat
router.put('/:chatId/leave', verifyToken, val.chatId, async(req, res, next) => {
    try{
        const chatId = parseInt(req.params.chatId, 10);
        const { id } = req.user;
        const chatMember = await controller.leaveChat(chatId, id);
        res.json(chatMember);
    }
    catch (err) {
        next(err);
    }
});

// Unhide a chat
router.put('/:chatId/unhide', verifyToken, val.chatId, async(req, res, next) => {
    try{
        const chatId = parseInt(req.params.chatId, 10);
        const { id } = req.user;
        const chatMember = await controller.unhideChat(chatId, id);
        res.json(chatMember);
    }
    catch (err) {
        next(err);
    }
});

// Edit a chat message
router.put('/messages/:messageId', verifyToken, val.messageId, val.content,
     async(req, res, next) => {
    try{
        const messageId = parseInt(req.params.messageId, 10);
        const { id } = req.user;
        const { content } = req.body;
        const message = await controller.editChatMessage(messageId, id, content);
        res.json(message);
    }
    catch (err) {
        next(err);
    }
});

// ----- DELETE -----
// Delete a chat message
router.delete('/messages/:messageId', verifyToken, val.messageId, async(req, res, next) => {
    try{
        const messageId = parseInt(req.params.messageId, 10);
        const { id } = req.user;
        const message = await controller.deleteChatMessage(messageId, id);
        res.json(message);
    }
    catch (err) {
        next(err);
    }
});

export default router;