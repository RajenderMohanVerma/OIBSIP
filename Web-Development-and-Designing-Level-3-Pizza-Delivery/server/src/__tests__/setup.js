// Test environment setup
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/crust-and-craft-test';
process.env.JWT_SECRET = 'test-secret-key-for-jest-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_URL = 'http://localhost:5173';
// Intentionally unset Razorpay for tests to exercise graceful degradation
process.env.RAZORPAY_KEY_ID = '';
process.env.RAZORPAY_KEY_SECRET = '';

