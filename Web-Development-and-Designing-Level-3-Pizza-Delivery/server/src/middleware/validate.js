const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware that reads express-validator results and returns 422 on failures.
 * Must be placed after the validation chain in routes.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
    }));
    return sendError(res, 'Validation failed. Please check your input.', 422, formatted);
  }
  next();
};

module.exports = validate;

