import type { Request, Response } from 'express';
import errorHandler from '../error-handler';
import createTestKnex from '../../../tests/test-knex';
import createDiscordApi from '../../../discord-api';
import { createServerDeps } from '../../../tests/test-deps';
import * as env from '../../../env';

const originalNodeEnv = env.NODE_ENV;
afterEach(async () => {
  Object.assign(env, { NODE_ENV: originalNodeEnv });
});

test('if headers are sent go to error handler', async () => {
  const deps = await createServerDeps(createTestKnex(), createDiscordApi());
  const handler = errorHandler(deps);

  const ex = new Error('test error');
  const req = ({} as unknown) as Request;
  const res = ({ headersSent: true } as unknown) as Response;
  const next = jest.fn();

  expect(handler(ex, req, res, next)).toBeUndefined();
  expect(next).toHaveBeenCalledWith(ex);
  expect(deps.logger.error).not.toHaveBeenCalled();
});

test('if headers are not sent log error and send error in body with 500 status if in production', async () => {
  const deps = await createServerDeps(createTestKnex(), createDiscordApi());
  const handler = errorHandler(deps);
  const next = jest.fn();
  const ex = new Error('test error');

  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

  expect(handler(
    ex,
    ({} as unknown) as Request,
    ({ status: mockStatus } as unknown) as Response,
    next,
  ))
    .toBeUndefined();
  expect(next).not.toHaveBeenCalled();
  expect(deps.logger.error).toHaveBeenCalledWith(ex);
  expect(mockStatus).toHaveBeenCalledWith(500);
  expect(mockJson).toHaveBeenCalledWith(ex);
});

test('if headers are not sent log error and send an empty body wtih 500 status out of production', async () => {
  const deps = await createServerDeps(createTestKnex(), createDiscordApi());
  const handler = errorHandler(deps);

  const ex = new Error('test error');
  const req = ({} as unknown) as Request;
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const res = ({ status } as unknown) as Response;
  const next = jest.fn();

  expect(handler(ex, req, res, next)).toBeUndefined();
  expect(next).not.toHaveBeenCalled();
  expect(deps.logger.error).toHaveBeenCalledWith(ex);
  expect(status).toHaveBeenCalledWith(500);
  expect(json).toHaveBeenCalledWith(ex);
});
