// Test environment setup
require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // ignore
}

process.env.NODE_ENV = 'test';
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/crust-and-craft-test';
} else {
  // Use test database so dev database is never affected
  const uri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = uri.includes('?') 
    ? uri.replace(/\/[^/?]+(\?)/, '/crust-and-craft-test$1')
    : uri.replace(/\/[^/]+$/, '/crust-and-craft-test');
}

process.env.JWT_SECRET = 'test-secret-key-for-jest-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_URL = 'http://localhost:5173';
// Intentionally unset Razorpay for tests to exercise graceful degradation
process.env.RAZORPAY_KEY_ID = '';
process.env.RAZORPAY_KEY_SECRET = '';
