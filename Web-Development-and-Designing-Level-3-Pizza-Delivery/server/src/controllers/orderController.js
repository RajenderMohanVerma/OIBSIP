const Pizza = require('../models/Pizza');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ─── Pricing constants ────────────────────────────────────────────────────────
const TAX_RATE = 0.05; // 5% GST
const FREE_DELIVERY_THRESHOLD = 500; // Free delivery above ₹500
const DELIVERY_FEE = 40;

const DEFAULT_SIZES = [
  { label: 'Small', priceAdjustment: 0 },
  { label: 'Medium', priceAdjustment: 80 },
  { label: 'Large', priceAdjustment: 160 },
];

const DEFAULT_CRUSTS = [
  { label: 'Thin', priceAdjustment: 0 },
  { label: 'Classic', priceAdjustment: 20 },
  { label: 'Stuffed', priceAdjustment: 60 },
];

/**
 * Calculates the server-side price for a single order item.
 * Returns an enriched item object or throws.
 */
const calculateItemPrice = (pizza, item) => {
  const { size, crust, toppings = [], quantity, specialInstructions = '' } = item;

  const availableSizes = (pizza.sizes && pizza.sizes.length > 0) ? pizza.sizes : DEFAULT_SIZES;
  const availableCrusts = (pizza.crusts && pizza.crusts.length > 0) ? pizza.crusts : DEFAULT_CRUSTS;
  const availableToppings = pizza.availableToppings || [];

  // Find size adjustment
  const sizeObj = availableSizes.find((s) => s.label.toLowerCase() === (size || '').toLowerCase()) || availableSizes[0];
  if (!sizeObj) throw new Error(`Invalid size "${size}" for pizza "${pizza.name}"`);

  // Find crust adjustment
  const crustObj = availableCrusts.find((c) => c.label.toLowerCase() === (crust || '').toLowerCase()) || availableCrusts[0];
  if (!crustObj) throw new Error(`Invalid crust "${crust}" for pizza "${pizza.name}"`);

  // Validate and price toppings
  let toppingsTotal = 0;
  const validatedToppings = [];
  for (const requestedTopping of toppings) {
    const toppingObj = availableToppings.find(
      (t) => t.name.toLowerCase() === (requestedTopping.name || '').toLowerCase()
    );
    if (toppingObj) {
      toppingsTotal += toppingObj.price;
      validatedToppings.push({ name: toppingObj.name, price: toppingObj.price });
    }
  }

  const unitPrice =
    pizza.basePrice + sizeObj.priceAdjustment + crustObj.priceAdjustment + toppingsTotal;

  const itemTotal = parseFloat((unitPrice * quantity).toFixed(2));

  return {
    pizza: pizza._id,
    pizzaName: pizza.name,
    pizzaImage: pizza.imageUrl || '',
    size,
    crust,
    toppings: validatedToppings,
    quantity,
    basePrice: pizza.basePrice,
    sizeAdjustment: sizeObj.priceAdjustment,
    crustAdjustment: crustObj.priceAdjustment,
    toppingsTotal,
    unitPrice: parseFloat(unitPrice.toFixed(2)),
    itemTotal,
    specialInstructions: specialInstructions.slice(0, 200),
  };
};

/**
 * POST /api/orders
 * Creates a new order. Calculates prices server-side.
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Your order must contain at least one item.', 400);
    }

    if (!['razorpay', 'cod'].includes(paymentMethod)) {
      return sendError(res, 'Invalid payment method.', 400);
    }

    // Fetch all referenced pizzas
    const pizzaIds = [...new Set(items.map((i) => i.pizzaId))];
    const pizzas = await Pizza.find({ _id: { $in: pizzaIds }, isAvailable: true });

    if (pizzas.length !== pizzaIds.length) {
      return sendError(res, 'One or more pizzas are unavailable or do not exist.', 400);
    }

    const pizzaMap = {};
    pizzas.forEach((p) => (pizzaMap[p._id.toString()] = p));

    // Calculate each item server-side
    const calculatedItems = [];
    for (const item of items) {
      const pizza = pizzaMap[item.pizzaId];
      if (!pizza) return sendError(res, `Pizza not found: ${item.pizzaId}`, 400);
      if (item.quantity < 1 || item.quantity > 10) {
        return sendError(res, 'Item quantity must be between 1 and 10.', 400);
      }
      const calculatedItem = calculateItemPrice(pizza, item);
      calculatedItems.push(calculatedItem);
    }

    const subtotal = parseFloat(
      calculatedItems.reduce((sum, i) => sum + i.itemTotal, 0).toFixed(2)
    );

    // Apply coupon if provided
    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return sendError(res, 'Invalid or expired coupon code.', 400);
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return sendError(res, 'This coupon has expired.', 400);
      }
      if (subtotal < coupon.minimumOrderAmount) {
        return sendError(
          res,
          `This coupon requires a minimum order of ₹${coupon.minimumOrderAmount}.`,
          400
        );
      }
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return sendError(res, 'This coupon has reached its usage limit.', 400);
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = parseFloat(((subtotal * coupon.discountValue) / 100).toFixed(2));
        if (coupon.maxDiscountAmount !== null) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else {
        discountAmount = Math.min(coupon.discountValue, subtotal);
      }

      appliedCoupon = coupon.code;
      // Increment usage count
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }

    const afterDiscount = parseFloat((subtotal - discountAmount).toFixed(2));
    const deliveryFee = afterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const taxAmount = parseFloat((afterDiscount * TAX_RATE).toFixed(2));
    const totalAmount = parseFloat((afterDiscount + deliveryFee + taxAmount).toFixed(2));

    const order = await Order.create({
      customer: req.user._id,
      items: calculatedItems,
      subtotal,
      couponCode: appliedCoupon,
      discountAmount,
      deliveryFee,
      taxAmount,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'not_applicable' : 'pending',
      orderStatus: 'placed',
      statusHistory: [{ status: 'placed', updatedBy: req.user._id }],
    });

    // Increment popularity for ordered pizzas
    for (const pizzaId of pizzaIds) {
      await Pizza.findByIdAndUpdate(pizzaId, { $inc: { popularity: 1 } });
    }

    logger.info(`Order created: ${order.orderNumber} by ${req.user.email}`);

    return sendSuccess(res, { order }, 'Order placed successfully!', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/my-orders
 */
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { customer: req.user._id };
    if (status) query.orderStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    return sendPaginated(res, orders, total, page, limit);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone');

    if (!order) {
      return sendError(res, 'Order not found.', 404);
    }

    // Customers can only view their own orders
    if (
      req.user.role !== 'admin' &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 'Access denied. This order does not belong to you.', 403);
    }

    return sendSuccess(res, { order });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/validate-cart
 * Validates and reprices cart items without creating an order.
 */
const validateCart = async (req, res, next) => {
  try {
    const { items, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Cart is empty.', 400);
    }

    const pizzaIds = [...new Set(items.map((i) => i.pizzaId))];
    const pizzas = await Pizza.find({ _id: { $in: pizzaIds }, isAvailable: true });
    const pizzaMap = {};
    pizzas.forEach((p) => (pizzaMap[p._id.toString()] = p));

    const calculatedItems = [];
    for (const item of items) {
      const pizza = pizzaMap[item.pizzaId];
      if (!pizza) return sendError(res, `Pizza "${item.pizzaId}" is no longer available.`, 400);
      const calculatedItem = calculateItemPrice(pizza, item);
      calculatedItems.push(calculatedItem);
    }

    const subtotal = parseFloat(calculatedItems.reduce((s, i) => s + i.itemTotal, 0).toFixed(2));
    let discountAmount = 0;
    let couponMessage = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date()) && subtotal >= coupon.minimumOrderAmount) {
        if (coupon.discountType === 'percentage') {
          discountAmount = parseFloat(((subtotal * coupon.discountValue) / 100).toFixed(2));
          if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        } else {
          discountAmount = Math.min(coupon.discountValue, subtotal);
        }
        couponMessage = `Coupon applied! You save ₹${discountAmount}`;
      } else {
        couponMessage = 'Coupon code is invalid or does not meet requirements.';
      }
    }

    const afterDiscount = parseFloat((subtotal - discountAmount).toFixed(2));
    const deliveryFee = afterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const taxAmount = parseFloat((afterDiscount * TAX_RATE).toFixed(2));
    const totalAmount = parseFloat((afterDiscount + deliveryFee + taxAmount).toFixed(2));

    return sendSuccess(res, {
      items: calculatedItems,
      subtotal,
      discountAmount,
      couponMessage,
      deliveryFee,
      taxAmount,
      totalAmount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, validateCart };

