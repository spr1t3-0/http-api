'use strict';

const { gql } = require('apollo-server-core');

exports.typeDefs = gql`
  type User {
    id: ID!
    nick: String!
    lastSeen: DateTime!
    joinedAt: DateTime!
  }
`;

exports.resolvers = {};
