const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const user = await User.create({ name, email, password, phone });

    const token = signToken(user._id);

    logger.info(`New user registered: ${user.email}`);

    return sendSuccess(
      res,
      { token, user },
      'Account created successfully. Welcome to Crust & Craft!',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password field (excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = signToken(user._id);

    // Remove password before sending
    user.password = undefined;

    logger.info(`User logged in: ${user.email}`);

    return sendSuccess(res, { token, user }, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }
    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, { user }, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/add-address
 */
const addAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, postalCode, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (user.savedAddresses.length >= 5) {
      return sendError(res, 'You can save up to 5 addresses.', 400);
    }

    user.savedAddresses.push({ label, street, city, state, postalCode, phone });
    await user.save();

    return sendSuccess(res, { addresses: user.savedAddresses }, 'Address saved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/auth/address/:addressId
 */
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedAddresses = user.savedAddresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );
    await user.save();
    return sendSuccess(res, { addresses: user.savedAddresses }, 'Address removed.');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, addAddress, deleteAddress };

