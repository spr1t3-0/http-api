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
      files: [
        './tests/**/*.js',
        '**/__tests__/*.test.js',
        '**/__mocks__/*.js',
      ],
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
    },
  ],
};
