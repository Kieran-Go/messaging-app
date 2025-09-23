import { validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Pass errors to error handler
    return next({ 
      status: 400, 
      errors: errors.array() 
    });
  }
  next();
};

export default validateRequest;