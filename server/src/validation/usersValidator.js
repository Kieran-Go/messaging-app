import { body, param } from 'express-validator';
import validateRequest from './validateRequest.js';

export default {

    userId: [
        param('id')
            .isInt({gt: 0}).withMessage('ID must be a positive integer'),

        validateRequest
    ],

    username: [
        body("username")
            .trim()
            .notEmpty().withMessage("Username is required")
            .isLength({ min: 2, max: 32 }).withMessage("Username must be 2–32 characters long")
            .isAlphanumeric().withMessage("Username must contain only letters and numbers"),

        validateRequest
    ],

    password: [
        body("password")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 8, max: 64 }).withMessage("Password must be 8-64 characters long"),

        validateRequest
    ],

    lastSeen: [
        body("lastSeen")
            .optional({ checkFalsy: true })
            .isDate().withMessage("Must be a valid date format"),

        validateRequest
    ],

    editUser: [
        body("username")
                .optional({ checkFalsy: true })
                .trim()
                .isLength({ min: 2, max: 32 }).withMessage("Username must be 2–32 characters long"),

        
        body("password")
                .optional({ checkFalsy: true })
                .isLength({ min: 8, max: 64 }).withMessage("Password must be 8–64 characters long"),


        body("lastSeen")
                .optional({ checkFalsy: true })
                .isDate().withMessage("Must be a valid date format"),

        validateRequest
    ],
}