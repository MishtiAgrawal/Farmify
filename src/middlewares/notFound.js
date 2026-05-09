const ErrorResponse = require('../utils/errorResponse');

const notFound = (req, res, next) => {
  next(new ErrorResponse(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = notFound;
