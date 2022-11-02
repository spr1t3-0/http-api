import type { Config } from 'jest';

export default {
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
  ],
  globalSetup: '<rootDir>/tests/setup.ts',
  transform: {
    '\\.ts$': 'ts-jest',
  },
} as Config;
