import type { Config } from 'jest';

const jestConfig: Config = {
  testMatch: [
    '**/__tests__/*.test.ts',
  ],
  testEnvironment: 'node',
  clearMocks: true,
  transform: {
    '\\.ts$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    './db/*',
    './migrations/*',
    './seeds/*',
    './tests/**/*',
    './email/*',
    './server/*',
  ],
  coveragePathIgnorePatterns: [
    './*.json',
    './email/__tests__/*',
    './email/__mocks__/*',
    './server/__tests__/*',
  ],
};

export default jestConfig;
