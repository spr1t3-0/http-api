'use strict';

const { gql } = require('apollo-server-core');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const scalarSchema = require('./scalar');
const userSchema = require('./user');
const drugSchema = require('./drug');
const drugNameSchema = require('./drug-name');

const baseTypeDefs = gql`
  type Query {
    _empty: Void
  }

  type Mutation {
    _empty: Void
  }

  input Pagination {
    page: UnsignedInt
    offset: UnsignedInt
  }
`;

module.exports = function createGraphQlSchema() {
  return makeExecutableSchema([
    scalarSchema,
    userSchema,
    drugSchema,
    drugNameSchema,
  ]
    .reduce((acc, schema) => ({
      typeDefs: acc.typeDefs.concat(schema.typeDefs),
      resolvers: {
        ...acc.resolvers,
        ...schema.resolvers,
        Query: {
          ...acc.resolvers.Query,
          ...schema.resolvers.Query,
        },
        Mutation: {
          ...acc.resolvers.Mutation,
          ...schema.resolvers.Mutation,
        },
      },
    }), {
      typeDefs: [baseTypeDefs],
      resolvers: {
        Query: {},
        Mutation: {},
      },
    }));
};
