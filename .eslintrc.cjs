module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:snarkyjs/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['@typescript-eslint', 'snarkyjs'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-constant-condition': 'off',
    'prefer-const': 'off',
    'max-len': ['error', { code: 120 }],
  },
};
