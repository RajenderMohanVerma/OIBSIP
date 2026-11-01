const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Verifies the JWT from the Authorization header (Bearer token).
 * Attaches req.user on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Authentication token is missing.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Your session has expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid authentication token.', 401);
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return sendError(res, 'User account not found or has been deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return sendError(res, 'Authentication failed due to an internal error.', 500);
  }
};

/**
 * Requires the authenticated user to have the 'admin' role.
 * Must be used after authenticate().
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 'Access denied. Administrator privileges required.', 403);
  }
  next();
};

module.exports = { authenticate, requireAdmin };

