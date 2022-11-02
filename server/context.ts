import type { IncomingHttpHeaders } from 'http';
import type { BaseContext } from '@apollo/server';
import type { Knex } from 'knex';
import type { ServerDeps } from '.';
import createDb from './db';

const BEARER_TOKEN_PATTERN = /^Bearer\s/;

export interface Context extends BaseContext {
  knex: Knex;
  appId: string | null;
  db: ReturnType<typeof createDb>;
}

export default function getContext(
  { knex, config }: ServerDeps,
  headers: IncomingHttpHeaders,
): Context {
  let appId = null;
  if (headers.authorization) {
    if (BEARER_TOKEN_PATTERN.test(headers.authorization)) {
      const authToken = headers.authorization.replace(BEARER_TOKEN_PATTERN, '');
      appId = config.findAppIdByApiToken(authToken);
      if (!appId) throw new Error('Invalid bearer token');
    } else throw new Error('Authorization header requires a bearer token');
  }

  return {
    knex,
    appId,
    db: createDb(knex),
  };
}
