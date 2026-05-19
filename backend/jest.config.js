/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!index.js',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 60,
      branches: 60,
      functions: 60,
      statements: 60,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
};
