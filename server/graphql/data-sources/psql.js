'use strict';

const { DataSource } = require('apollo-datasource');

module.exports = class PsqlDataSource extends DataSource {
  constructor(knex) {
    super();
    this.knex = knex;
  }

  async userRelation(userId, tableName, columnName = 'userId') {
    return this.knex('users')
      .innerJoin(tableName, 'users.id', `${tableName}.${columnName}`)
      .where('users.id', userId)
      .select('users.*')
      .first();
  }
};
