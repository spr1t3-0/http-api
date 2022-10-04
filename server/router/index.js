'use strict';

const express = require('express');
const { createValidator } = require('express-joi-validation');

module.exports = function createRouter(deps) {
  const router = express.Router();
  const validator = createValidator();
  const routeDeps = { ...deps, validator };

  router.use(express.json());

  [].forEach(applyRoute => {
    applyRoute(routeDeps);
  });

  return router;
};
