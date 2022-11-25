import http from 'node:http';
import { expressMiddleware } from '@apollo/server/express4';
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import type { Logger } from 'winston';
import createApollo from './apollo';
import createContext from './context';
import type { Db } from '../db';
import type { Emails } from '../email';
import type { Config } from '../create-config';
import type { DiscordApi } from '../discord-api';
import router from './router';
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
  app.use(helmet());
  app.use(cors());

  const httpServer = http.createServer(app);
  app.use('/graphql', express.json(), expressMiddleware(createApollo(httpServer), {
    context: createContext(deps),
  }));

  app.use(router(deps));
  app.use(errorHandler(deps));

  return new Promise(resolve => {
    httpServer.listen(HTTP_PORT, () => resolve(app));
  });
}
