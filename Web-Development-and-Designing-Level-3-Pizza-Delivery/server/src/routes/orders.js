const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  validateCart,
} = require('../controllers/orderController');

router.post('/validate-cart', authenticate, validateCart);
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);

module.exports = router;

