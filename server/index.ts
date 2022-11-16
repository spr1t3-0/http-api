import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import type { Logger } from 'winston';
import type { Db } from '../db';
import type { Emails } from '../email';
import type { Config } from '../create-config';
import type { DiscordApi } from '../discord-api';
import createSchema from './schema';
import applyDirectives from './directives';
import createContext, { Context } from './context';
import { HTTP_PORT } from '../env';

export interface ServerDeps {
  logger: Logger;
  db: Db;
  discordApi: DiscordApi;
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
    context: createContext(deps),
  });
}
