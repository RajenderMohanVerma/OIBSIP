const router = require('express').Router();
const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');

// Webhook must receive raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Parse raw buffer back to JSON object for our handler
  if (Buffer.isBuffer(req.body)) {
    req.body = JSON.parse(req.body.toString());
  }
  next();
}, handleWebhook);

router.post('/create-order', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);

module.exports = router;

