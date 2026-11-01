const router = require('express').Router();
const {
  getAllPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
  getFeaturedPizzas,
} = require('../controllers/pizzaController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public routes (customers see only available pizzas)
router.get('/featured', getFeaturedPizzas);
router.get('/', getAllPizzas);
router.get('/:id', getPizzaById);

// Admin-only routes
router.post('/', authenticate, requireAdmin, createPizza);
router.patch('/:id', authenticate, requireAdmin, updatePizza);
router.delete('/:id', authenticate, requireAdmin, deletePizza);

module.exports = router;

