require('dotenv').config();
const validateEnv = require('./config/validateEnv');
const connectDB = require('./config/database');
const app = require('./app');
const logger = require('./utils/logger');

// Validate environment variables before anything else
validateEnv();

const PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`🍕 Crust & Craft API running on port ${PORT}`);
    logger.info(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    logger.info(`   Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Promise Rejection: ${reason}`);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
  });
};

startServer();

