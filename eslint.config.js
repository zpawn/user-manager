'use strict';

const init = require('eslint-config-metarhia');

module.exports = init;
module.exports = [
  ...init,
  {
    files: ['static/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        indexedDB: true,
        prompt: true,
      },
    },
  },
];
