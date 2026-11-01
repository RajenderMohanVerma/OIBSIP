/**
 * Validates that all required environment variables are present at startup.
 * Exits the process with a descriptive error if any are missing.
 * Never prints secret values to the log.
 */
const validateEnv = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLIENT_URL',
  ];

  const optional = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌  Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\nCopy server/.env.example to server/.env and fill in the values.\n');
    process.exit(1);
  }

  const missingOptional = optional.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn('\n⚠️  Optional environment variables not set (some features will be disabled):');
    missingOptional.forEach((key) => console.warn(`   - ${key}`));
    console.warn('   Razorpay payments will not be available without credentials.\n');
  }
};

module.exports = validateEnv;

