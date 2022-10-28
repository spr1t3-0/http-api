import type { Config } from 'jest';

export default {
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
  ],
  globalSetup: '<rootDir>/tests/setup.js',
} as Config;
