'use strict';

module.exports = {
  root: true,
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    sourceType: 'script',
    ecmaVersion: 2022,
  },
  rules: {
    strict: [2, 'global'],
    'arrow-parens': [2, 'as-needed'],
  },
  overrides: [
    {
      files: ['**/*.ts'],
      extends: [
        'airbnb-base',
        'airbnb-typescript/base',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    {
      files: [
        './tests/**/*.ts',
        '**/__tests__/*.test.ts',
        '**/__mocks__/*.ts',
      ],
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
    },
    {
      files: [
        './seeds/*.ts',
      ],
      rules: {
        'import/prefer-default-export': 0,
      },
    },
  ],
};
