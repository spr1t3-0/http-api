'use strict';

const { DataSource } = require('apollo-datasource');

module.exports = class PsqlDataSource extends DataSource {
  constructor(knex) {
    super();
    this.knex = knex;
  }
};
