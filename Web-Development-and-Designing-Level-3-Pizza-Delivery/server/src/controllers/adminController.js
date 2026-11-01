const User = require('../models/User');
const Order = require('../models/Order');
const Pizza = require('../models/Pizza');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      revenueAgg,
      popularPizzas,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'preparing'] } }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { paymentStatus: { $in: ['paid', 'not_applicable'] }, orderStatus: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.pizza',
            name: { $first: '$items.pizzaName' },
            totalOrdered: { $sum: '$items.quantity' },
          },
        },
        { $sort: { totalOrdered: -1 } },
        { $limit: 5 },
      ]),
      Order.find()
        .sort('-createdAt')
        .limit(10)
        .populate('customer', 'name email')
        .lean(),
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    return sendSuccess(res, {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      popularPizzas,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('customer', 'name email phone')
        .lean(),
      Order.countDocuments(query),
    ]);

    return sendPaginated(res, orders, total, page, limit);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendError(res, 'Order not found.', 404);
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      updatedBy: req.user._id,
      note: note || `Status updated to ${status} by admin`,
    });

    // If COD order is delivered, mark payment as complete
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    logger.info(
      `Order ${order.orderNumber} status updated to "${status}" by admin ${req.user.email}`
    );

    return sendSuccess(res, { order }, `Order status updated to "${status}".`);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/customers
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Never expose passwords – select explicitly
    const [customers, total] = await Promise.all([
      User.find(query)
        .select('name email phone createdAt isActive')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    // Attach order count for each customer
    const customerIds = customers.map((c) => c._id);
    const orderCounts = await Order.aggregate([
      { $match: { customer: { $in: customerIds } } },
      { $group: { _id: '$customer', count: { $sum: 1 } } },
    ]);

    const orderCountMap = {};
    orderCounts.forEach((o) => (orderCountMap[o._id.toString()] = o.count));

    const enriched = customers.map((c) => ({
      ...c,
      orderCount: orderCountMap[c._id.toString()] || 0,
    }));

    return sendPaginated(res, enriched, total, page, limit);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders/:id
 */
const getOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
    if (!order) return sendError(res, 'Order not found.', 404);
    return sendSuccess(res, { order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  getOrderDetail,
};

