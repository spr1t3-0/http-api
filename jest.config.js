'use strict';

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
  ],
  globalSetup: '<rootDir>/tests/setup.js',
};

module.exports = config;
