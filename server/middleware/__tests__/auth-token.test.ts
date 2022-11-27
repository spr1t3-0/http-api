import type { Request, Response } from 'express';
import authToken from '../auth-token';
import createTestKnex from '../../../tests/test-knex';
import createDiscordApi from '../../../discord-api';
import { createServerDeps } from '../../../tests/test-deps';

test('calls next if there is no authorization header', async () => {
  const deps = await createServerDeps(createTestKnex(), createDiscordApi());
  const handler = authToken(deps);

  const req = ({ headers: {} } as unknown) as Request;
  const locals = {};
  const res = ({ locals } as unknown) as Response;
  const next = jest.fn();

  expect(handler(req, res, next)).toBeUndefined();
  expect(locals).toEqual({});
  expect(deps.config.findAppIdByApiToken).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
  expect(deps.logger.warn).not.toHaveBeenCalled();
});

test('if appId does not exist respond with 401 and log warning', async () => {
  const deps = await createServerDeps(createTestKnex(), createDiscordApi());
  (deps.config.findAppIdByApiToken as jest.Mock).mockReturnValue(null);
  const handler = authToken(deps);

  const req = ({
    headers: {
      authorization: 'Bearer mockAppId',
    },
  } as unknown) as Request;
  const sendStatus = jest.fn();
  const res = ({ sendStatus, locals: {} } as unknown) as Response;
  const next = jest.fn();

  expect(handler(req, res, next)).toBeUndefined();
  expect(res.locals).toEqual({});
  expect(deps.config.findAppIdByApiToken).toHaveBeenCalledWith('mockAppId');
  expect(next).not.toHaveBeenCalled();
  expect(deps.logger.warn).toHaveBeenCalledWith('Invalid App ID:', req);
  expect(sendStatus).toHaveBeenCalledWith(401);
});

test.skip('if appId exists assign it to res.locals', async () => {
  const deps = await createServerDeps(createTestKnex(), createDiscordApi());
  (deps.config.findAppIdByApiToken as jest.Mock).mockReturnValue('mockAppId');
  const handler = authToken(deps);

  const req = ({ headers: 'Bearer mockAppId' } as unknown) as Request;
  const res = ({ locals: {} } as unknown) as Response;
  const next = jest.fn();

  expect(handler(req, res, next)).toBeUndefined();
  expect(res.locals).toEqual({ appId: 'mockAppId' });
  expect(deps.config.findAppIdByApiToken).toHaveBeenCalledWith('mockAppId');
  expect(next).toHaveBeenCalled();
  expect(deps.logger.warn).not.toHaveBeenCalled();
});
