import type { GraphQLSchema } from 'graphql';
import * as auth from './auth';

const DIRECTIVES = [
  auth,
];

export default function applyDirectives(schema: GraphQLSchema) {
  return DIRECTIVES
    .map(directive => directive.transform)
    .reduce((acc, transform) => transform(acc), schema);
}

export const typeDefs = DIRECTIVES.map(directive => directive.typeDefs);
