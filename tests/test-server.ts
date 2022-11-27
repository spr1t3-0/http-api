import { ApolloServer } from '@apollo/server';
import type { Knex } from 'knex';
import type { Context } from '../server/context';
import type { DiscordApi } from '../discord-api';
import type { AppId } from '../create-config';
import createLogger from '../logger';
import createEmail from '../email';
import createDb from '../db';
import createSchema from '../server/apollo/schema';

jest.mock('../logger');
jest.mock('../email');

export default function createTestServer() {
  return new ApolloServer({
    schema: createSchema(),
  });
}

export async function createTestContext(
  knex: Knex,
  discordApi: DiscordApi,
  appId: AppId | null = null,
): Promise<Context> {
  return {
    appId,
    discordApi,
    logger: createLogger(),
    db: createDb(knex),
    email: await createEmail(),
  };
}
