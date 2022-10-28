'use strict';

const Psql = require('./psql');

module.exports = function datasources({ knex }) {
  return {
    psql: new Psql(knex),
  };
};
