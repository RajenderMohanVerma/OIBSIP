const router = require('express').Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Validation chains
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.post('/add-address', authenticate, addAddress);
router.delete('/address/:addressId', authenticate, deleteAddress);

module.exports = router;

