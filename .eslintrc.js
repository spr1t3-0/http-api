'use strict';

module.exports = {
  root: true,
  env: {
    node: true,
    // 'browser': true, // I had this set before but idk why
    // 'commonjs': true, // I had this set before but idk why
    es2022: true,
  },
  extends: [
    'airbnb-base',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'script',
    ecmaVersion: 2022,
  },
  rules: {
    // This enforces strict checks on .js files, it's not necessary for .ts files
    // https://www.w3schools.com/js/js_strict.asp
    strict: [2, 'global'],
    // Removes () around single parameter arrow functions
    'arrow-parens': [2, 'as-needed'],
    // This is a personal preference to enforce good code
    // '@typescript-eslint/no-non-null-assertion': 'warn',
    'max-len': ['warn', { code: 120 }],
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
      rules: {
        // This enforces strict checks on .js files, it's not necessary for .ts files
        // https://www.w3schools.com/js/js_strict.asp
        strict: [2, 'global'],
        // Removes () around single parameter arrow functions
        'arrow-parens': [2, 'as-needed'],
        // This is a personal preference to enforce good code
        // '@typescript-eslint/no-non-null-assertion': 'warn',
        'max-len': ['warn', { code: 120 }],
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
    {
      files: [
        './type-output/types.ts',
      ],
      rules: {
        'no-console': 0,
        'import/no-extraneous-dependencies': [2, { devDependencies: true }],
      },
    },
  ],
};
