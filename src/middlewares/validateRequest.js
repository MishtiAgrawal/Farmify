const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((error) => error.msg).join(', ');
    return next(new ErrorResponse(message, 400));
  }
  next();
};

module.exports = validateRequest;
