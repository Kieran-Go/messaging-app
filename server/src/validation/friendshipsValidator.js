import { body, param } from 'express-validator';
import validateRequest from './validateRequest.js';

export default {

    friendshipId: [
        param('id')
            .isInt({gt: 0}).withMessage('ID must be a positive integer'),

        validateRequest
    ],

    userId: [
        param('userId')
            .isInt({gt: 0}).withMessage('ID must be a positive integer'),

        validateRequest
    ],

    receiverId: [
        body('receiverId')
            .isInt({gt: 0}).withMessage('ID must be a positive integer')
            .notEmpty().withMessage('ID of receiver is required'),

        validateRequest
    ],
}