'use strict';

const Knex = require('knex');
const knexConfig = require('./knexfile');
const createLogger = require('./logger');
const createServer = require('./server');

const logger = createLogger();

createServer({
  logger,
  knex: Knex(knexConfig),
})
  .then(() => {
    logger.info('HTTP API is running!');
  })
  .catch(ex => {
    logger.error('Could not initiallize server:', ex);
    process.exit(1);
  });
