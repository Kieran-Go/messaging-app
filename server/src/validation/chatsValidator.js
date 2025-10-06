import { body, param } from 'express-validator';
import validateRequest from './validateRequest.js';

export default {
    chatId: [
        param('chatId')
            .isInt({gt: 0}).withMessage('ID must be a positive integer'),

        validateRequest
    ],

    userId: [
        body('userId')
            .isInt({gt: 0}).withMessage('ID must be a positive integer'),

        validateRequest
    ],

    messageId: [
        param('messageId')
            .isInt({gt: 0}).withMessage('ID must be a positive integer'),

        validateRequest
    ],

    chatName: [
        body('name')
            .optional({ nullable: true })
            .isString()
            .withMessage('Chat name must be a string')
            .isLength({ max: 50 })
            .withMessage('Chat name must be 50 characters or less'),

        validateRequest
    ],

    memberIds: [
        body('memberIds')
            .isArray({ max: 19 })
            .withMessage('memberIds must be an array with max 19 items')
            .bail()
            .custom((arr) => arr.every(id => Number.isInteger(id) && id > 0))
            .withMessage('All memberIds must be positive integers'),

        validateRequest
    ],

    content: [
        body('content')
            .isString()
            .withMessage("Content must be a string")
            .isLength({ max: 2000 })
            .withMessage("Message cannot exceed 2000 characters"),

        validateRequest
    ]
}