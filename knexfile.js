'use strict';

const knexStringcase = require('knex-stringcase');
const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = require('./env');

module.exports = knexStringcase({
  client: 'pg',
  connection: {
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
  },
});
