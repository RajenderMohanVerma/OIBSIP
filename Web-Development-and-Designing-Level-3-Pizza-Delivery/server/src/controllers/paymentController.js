const crypto = require('crypto');
const Order = require('../models/Order');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Lazily instantiate Razorpay to avoid crashing when credentials are missing
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes('your_key') || keySecret.includes('your_razorpay')) {
      return null;
    }

    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayInstance;
};

/**
 * POST /api/payments/create-order
 * Creates a Razorpay payment order. Amount is taken from the server-side Order record.
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const razorpay = getRazorpay();
    if (!razorpay) {
      return sendError(
        res,
        'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.',
        503
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Order not found.', 404);
    }

    // Only the order owner can pay
    if (order.customer.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied.', 403);
    }

    if (order.paymentStatus === 'paid') {
      return sendError(res, 'This order has already been paid.', 400);
    }

    if (order.paymentMethod !== 'razorpay') {
      return sendError(res, 'This order is not configured for online payment.', 400);
    }

    // Amount in paise (smallest Indian currency unit)
    const amountInPaise = Math.round(order.totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        customerEmail: req.user.email,
      },
    });

    // Save Razorpay order ID to our order record
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    logger.info(`Razorpay order created for ${order.orderNumber}: ${razorpayOrder.id}`);

    return sendSuccess(res, {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    logger.error(`Razorpay create-order error: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature. ONLY marks payment as paid after server-side verification.
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret.includes('your_razorpay')) {
      return sendError(res, 'Payment verification is not configured.', 503);
    }

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      logger.warn(`Payment signature mismatch for order ${orderId}`);
      return sendError(res, 'Payment verification failed. Signature mismatch.', 400);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Order not found.', 404);
    }

    // Idempotency: if already verified, return success
    if (order.paymentStatus === 'paid' && order.razorpayPaymentId === razorpayPaymentId) {
      return sendSuccess(res, { order }, 'Payment already verified.');
    }

    // Verify the razorpay order ID matches what we stored
    if (order.razorpayOrderId !== razorpayOrderId) {
      logger.warn(`Razorpay order ID mismatch for order ${orderId}`);
      return sendError(res, 'Payment verification failed. Order ID mismatch.', 400);
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.orderStatus = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      updatedBy: req.user._id,
      note: 'Payment verified via Razorpay',
    });
    await order.save();

    logger.info(`Payment verified for order ${order.orderNumber}: ${razorpayPaymentId}`);

    return sendSuccess(res, { order }, 'Payment verified successfully. Your order is confirmed!');
  } catch (error) {
    logger.error(`Payment verification error: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/payments/webhook
 * Handles Razorpay webhook events. Verifies signature before processing.
 */
const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret.includes('your_webhook')) {
      logger.warn('Webhook received but RAZORPAY_WEBHOOK_SECRET is not configured.');
      return res.status(200).json({ received: true });
    }

    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.warn('Webhook signature verification failed.');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.paymentStatus !== 'paid') {
        // Verify amount matches
        const expectedAmountPaise = Math.round(order.totalAmount * 100);
        if (payment.amount !== expectedAmountPaise) {
          logger.warn(
            `Webhook amount mismatch for order ${order.orderNumber}: expected ${expectedAmountPaise}, got ${payment.amount}`
          );
        } else {
          order.paymentStatus = 'paid';
          order.razorpayPaymentId = payment.id;
          order.orderStatus = 'confirmed';
          order.statusHistory.push({
            status: 'confirmed',
            note: 'Payment confirmed via Razorpay webhook',
          });
          await order.save();
          logger.info(`Webhook: Order ${order.orderNumber} marked as paid.`);
        }
      }
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (order && order.paymentStatus === 'pending') {
        order.paymentStatus = 'failed';
        await order.save();
        logger.info(`Webhook: Payment failed for order ${order.orderNumber}.`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Webhook processing error: ${error.message}`);
    // Always return 200 to Razorpay to prevent retries on our errors
    return res.status(200).json({ received: true });
  }
};

module.exports = { createPaymentOrder, verifyPayment, handleWebhook };

