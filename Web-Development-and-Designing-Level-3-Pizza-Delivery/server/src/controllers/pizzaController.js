const Pizza = require('../models/Pizza');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * GET /api/pizzas
 * Supports: search, category filter, sort, pagination
 */
const getAllPizzas = async (req, res, next) => {
  try {
    const {
      search,
      category,
      isVeg,
      sort = '-popularity',
      page = 1,
      limit = 20,
      available,
    } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true';
    }

    if (available !== undefined) {
      query.isAvailable = available === 'true';
    } else {
      // Customers only see available pizzas; admins see all
      if (!req.user || req.user.role !== 'admin') {
        query.isAvailable = true;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [pizzas, total] = await Promise.all([
      Pizza.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Pizza.countDocuments(query),
    ]);

    return sendPaginated(res, pizzas, total, page, limit);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/pizzas/:id
 */
const getPizzaById = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return sendError(res, 'Pizza not found.', 404);
    }
    if (!pizza.isAvailable && (!req.user || req.user.role !== 'admin')) {
      return sendError(res, 'This pizza is currently unavailable.', 404);
    }
    return sendSuccess(res, { pizza });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/pizzas  (admin only)
 */
const createPizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.create(req.body);
    logger.info(`Pizza created by admin ${req.user.email}: ${pizza.name}`);
    return sendSuccess(res, { pizza }, 'Pizza added to menu successfully.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/pizzas/:id  (admin only)
 */
const updatePizza = async (req, res, next) => {
  try {
    // Prevent overwriting _id, createdAt
    const { _id, createdAt, __v, ...updates } = req.body;

    const pizza = await Pizza.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!pizza) {
      return sendError(res, 'Pizza not found.', 404);
    }

    logger.info(`Pizza updated by admin ${req.user.email}: ${pizza.name}`);
    return sendSuccess(res, { pizza }, 'Pizza updated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/pizzas/:id  (admin only)
 */
const deletePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);
    if (!pizza) {
      return sendError(res, 'Pizza not found.', 404);
    }
    logger.info(`Pizza deleted by admin ${req.user.email}: ${pizza.name}`);
    return sendSuccess(res, {}, 'Pizza removed from menu.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/pizzas/featured
 */
const getFeaturedPizzas = async (req, res, next) => {
  try {
    const pizzas = await Pizza.find({ isFeatured: true, isAvailable: true })
      .sort('-popularity')
      .limit(6)
      .lean();
    return sendSuccess(res, { pizzas });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
  getFeaturedPizzas,
};

