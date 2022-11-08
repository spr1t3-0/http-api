import type { IncomingMessage } from 'http';
import createLogger from '../../logger';
import createContext from '../context';
import type { ServerDeps } from '..';
import type { Db } from '../../db';
import createEmail from '../../email';
import createConfig from '../../create-config';

jest.mock('../../logger');
jest.mock('../../email');

let serverDeps: ServerDeps;
beforeEach(async () => {
  serverDeps = await Promise.all([
    createEmail(),
    createConfig(),
  ])
    .then(([email, config]) => ({
      email,
      config,
      db: {} as Db,
      logger: createLogger(),
    }));
});

test('Includes all server deps aside from "config"', async () => {
  const contextFn = createContext(serverDeps);
  const { config, ...contextDeps } = serverDeps;
  await expect(contextFn({
    req: {
      headers: {},
    } as IncomingMessage,
  }))
    .resolves.toEqual({
      ...contextDeps,
      appId: null,
    });
});

describe('appId', () => {
  test('If there is no authorization header "appId" should be null', async () => {
    const contextFn = createContext(serverDeps);
    const context = await contextFn({
      req: {
        headers: {},
      } as IncomingMessage,
    });
    expect(context.appId).toBeNull();
  });

  test('If there is an authorization header that does not start with "Bearer " throw an error', async () => {
    const contextFn = createContext(serverDeps);
    await expect(contextFn({
      req: {
        headers: {
          authorization: 'not a bearer token',
        },
      } as IncomingMessage,
    }))
      .rejects.toThrowError('Authorization header requires a bearer token');
  });

  test('If there is an invalid bearer token in an authorization header', async () => {
    const contextFn = createContext(serverDeps);
    await expect(contextFn({
      req: {
        headers: {
          authorization: 'Bearer validBearerToken',
        },
      } as IncomingMessage,
    }))
      .rejects.toThrowError('Invalid bearer token');
  });
});
