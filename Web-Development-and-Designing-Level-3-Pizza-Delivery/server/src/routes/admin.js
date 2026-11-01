const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  getOrderDetail,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetail);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAllCustomers);

module.exports = router;

