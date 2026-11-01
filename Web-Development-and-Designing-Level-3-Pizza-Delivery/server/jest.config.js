/**
 * Jest configuration for the server
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/seed.js'],
  setupFiles: ['./src/__tests__/setup.js'],
};

