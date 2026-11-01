require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth');
const pizzaRoutes = require('./routes/pizzas');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// ─── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy does not allow origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body parsing ──────────────────────────────────────────────────────────────
// Webhook route needs raw body — handle before json parser
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── Sanitize MongoDB operators in req body/query/params ─────────────────────
app.use(mongoSanitize());

// ─── HTTP request logging ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Crust & Craft API', timestamp: new Date() });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;

