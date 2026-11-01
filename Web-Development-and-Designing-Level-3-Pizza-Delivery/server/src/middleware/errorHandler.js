const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

/**
 * Global error handler middleware.
 * Catches all errors passed via next(err).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 'Validation failed.', statusCode, errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `A record with this ${field} already exists.`;
    return sendError(res, message, statusCode);
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
    return sendError(res, message, statusCode);
  }

  // Log unexpected errors
  if (!err.isOperational) {
    logger.error(`Unexpected error: ${err.stack}`);
  }

  return sendError(res, message, statusCode);
};

module.exports = errorHandler;

