'use strict';

const express = require('express');
const helmet = require('helmet');
const applyApollo = require('./graphql');
const router = require('./router');
const errorHandler = require('./middleware/error-handler');

module.exports = async function createServer(deps) {
  const app = express();
  app.use(helmet());
  app.use('/api', router(deps));
  app.use(errorHandler(deps));
  await applyApollo(app, deps);
  return app;
};
