import type { Knex } from 'knex';
import { createValidator } from 'express-joi-validation';
import type { DiscordApi } from '../discord-api';
import type { ServerDeps } from '../server';
import type { RouterDeps } from '../server/router';
import createLogger from '../logger';
import createEmail from '../email';
import createDb from '../db';
import createConfig from '../create-config';

jest.mock('../logger');
jest.mock('../email');
jest.mock('../db');
jest.mock('../create-config');

export async function createServerDeps(knex: Knex, discordApi: DiscordApi): Promise<ServerDeps> {
  return {
    discordApi,
    logger: createLogger(),
    db: createDb(knex),
    email: await createEmail(),
    config: await createConfig(),
  };
}

export async function createRouterDeps(knex: Knex, discordApi: DiscordApi): Promise<RouterDeps> {
  const serverDeps = await createServerDeps(knex, discordApi);
  return { ...serverDeps, validator: createValidator() };
}
