import { gql } from 'graphql-tag';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs as directiveTypeDefs } from '../directives';
import * as scalarSchema from './scalar';
import * as userSchemas from './user';
import * as drugSchemas from './drug';

const SCHEMAS = [
  scalarSchema,
  ...Object.values(userSchemas),
  ...Object.values(drugSchemas),
];

const baseTypeDefs = gql`
  type Query {
    _empty: Void
  }

  type Mutation {
    _empty: Void
  }
`;

export default function createGraphQlSchema() {
  return makeExecutableSchema({
    typeDefs: [
      baseTypeDefs,
      ...directiveTypeDefs,
      ...SCHEMAS.map((schema) => schema.typeDefs),
    ],

    resolvers: SCHEMAS
      .map((schema) => schema.resolvers)
      .reduce((acc, resolvers) => ({
        ...acc,
        ...resolvers,
        Query: {
          ...acc.Query,
          ...resolvers.Query,
        },
        Mutation: {
          ...acc.Mutation,
          ...resolvers.Mutation,
        },
      }), {
        Query: {},
        Mutation: {},
      }),
  });
}
