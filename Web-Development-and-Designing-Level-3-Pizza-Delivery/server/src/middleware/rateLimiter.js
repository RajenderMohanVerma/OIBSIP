const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

// Strict limiter for auth routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many requests from this IP. Please try again in 15 minutes.',
      429
    );
  },
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 'Too many requests. Please try again later.', 429);
  },
});

module.exports = { authLimiter, apiLimiter };

