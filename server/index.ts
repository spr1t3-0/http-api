import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import type { Logger } from 'winston';
import type { Knex } from 'knex';
import type { Emails } from '../email';
import type { Config } from '../create-config';
import createSchema from './schema';
import applyDirectives from './directives';
import getContext, { Context } from './context';
import { HTTP_PORT } from '../env';

export interface ServerDeps {
  logger: Logger;
  knex: Knex;
  email: Emails;
  config: Config;
}

export default async function createServer(deps: ServerDeps) {
  const server = new ApolloServer<Context>({
    schema: applyDirectives(createSchema()),
    csrfPrevention: true,
  });

  return startStandaloneServer(server, {
    listen: { port: HTTP_PORT },
    async context({ req }) {
      return getContext(deps, req.headers);
    },
  });
}
