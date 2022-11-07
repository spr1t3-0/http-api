import type { IncomingMessage } from 'http';
import type { BaseContext, ContextFunction } from '@apollo/server';
import type { ServerDeps } from '.';

const BEARER_TOKEN_PATTERN = /^Bearer\s/;

export interface Context extends BaseContext, Omit<ServerDeps, 'config'> {
  appId: string | null;
}

export type ContextFn = ContextFunction<[{ req: IncomingMessage }], Context>;

export default function createContext({ config, ...deps }: ServerDeps): ContextFn {
  return async ({ req }) => {
    let appId = null;
    if (req.headers.authorization) {
      if (BEARER_TOKEN_PATTERN.test(req.headers.authorization)) {
        const authToken = req.headers.authorization.replace(BEARER_TOKEN_PATTERN, '');
        appId = config.findAppIdByApiToken(authToken);
        if (!appId) throw new Error('Invalid bearer token');
      } else throw new Error('Authorization header requires a bearer token');
    }

    return {
      ...deps,
      appId,
    };
  };
}
