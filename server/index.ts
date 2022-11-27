import http from 'node:http';
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import type { Logger } from 'winston';
import type { Db } from '../db';
import type { Emails } from '../email';
import type { Config } from '../create-config';
import type { DiscordApi } from '../discord-api';
import router from './router';
import authenticate from './middleware/authenticate';
import errorHandler from './middleware/error-handler';
import { HTTP_PORT } from '../env';

export interface ServerDeps {
  logger: Logger;
  db: Db;
  discordApi: DiscordApi;
  email: Emails;
  config: Config;
}

export default async function createApp(deps: ServerDeps): Promise<Express> {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(helmet());
  app.use(cors());
  app.use(authenticate(deps));
  app.use(router(deps, httpServer));
  app.use(errorHandler(deps));

  return new Promise(resolve => {
    httpServer.listen(HTTP_PORT, () => resolve(app));
  });
}
