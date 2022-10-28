'use strict';

const express = require('express');
const { createValidator } = require('express-joi-validation');
const user = require('./user');

module.exports = function createRouter(deps) {
  const router = express.Router();
  const routeDeps = {
    ...deps,
    validator: createValidator(),
  };

  router.use(express.json());

  [
    user,
  ]
    .forEach(applyRoute => {
      applyRoute(router, routeDeps);
    });

  return router;
};
