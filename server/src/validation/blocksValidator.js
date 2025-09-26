import { param } from 'express-validator';
import validateRequest from './validateRequest.js';

export default {

    userId: [
        param('userId')
            .isInt({gt: 0}).withMessage('ID must be a positive integer'),

        validateRequest
    ],

    blockedId: [
        param('blockedId')
            .isInt({gt: 0}).withMessage('ID must be a positive integer'),

        validateRequest
    ],
}