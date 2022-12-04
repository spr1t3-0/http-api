import type { Config } from 'jest';

const jestConfig: Config = {
  testMatch: [
    '**/__tests__/*.spec.ts',
  ],
  testEnvironment: 'node',
  clearMocks: true,
  globalSetup: '<rootDir>/tests/setup.ts',
  transform: {
    '\\.ts$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    './server/schema/**/*',
  ],
  coveragePathIgnorePatterns: [
    './*.json',
    './server/schema/discord/__tests__/*',
    './server/schema/drug/__tests__/*',
    './server/schema/user/__tests__/*',
  ],
};

export default jestConfig;
