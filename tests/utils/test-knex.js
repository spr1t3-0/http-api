'use strict';

const Knex = require('knex');
const knexConfig = require('../../knexfile');

module.exports = function createTestKnex() {
  return Knex({
    ...knexConfig,
    conncetion: {
      ...knexConfig.connection,
      user: `${knexConfig.connection.user}_test`,
      database: `${knexConfig.connection.database}_test`,
    },
  });
};
