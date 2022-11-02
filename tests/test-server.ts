import { ApolloServer } from '@apollo/server';
import type { Knex } from 'knex';
import { typeDefs, resolvers } from '../server/schema';
import createDb from '../server/db';

interface BaseContext {
  knex: Knex;
  db: ReturnType<typeof createDb>;
}

export function createContext<AddedContext>(
  knex: Knex,
  ctx: AddedContext,
): AddedContext & BaseContext {
  return {
    knex,
    db: createDb(knex),
    ...ctx,
  };
}

export default function createTestServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
  });
}
