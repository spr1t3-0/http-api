import type { Server } from 'node:http';
import express, { Router } from 'express';
import PromiseRouter from 'express-promise-router';
import { createValidator, ExpressJoiInstance } from 'express-joi-validation';
import { expressMiddleware } from '@apollo/server/express4';
import createApollo from '../apollo';
import createContext from '../context';
import type { ServerDeps } from '..';

export interface RouterDeps extends ServerDeps {
  validator: ExpressJoiInstance;
}

export type Route = (router: Router, deps: ServerDeps) => void;

const ROUTES: Route[] = [];

export default function createRouter(serverDeps: ServerDeps, httpServer: Server): Router {
  const deps: RouterDeps = {
    ...serverDeps,
    validator: createValidator(),
  };

  const router = PromiseRouter();
  router.use(express.json());

  router.use('/graphql', expressMiddleware(createApollo(httpServer), {
    context: createContext(deps),
  }));

  ROUTES.forEach(applyRoute => applyRoute(router, deps));

  return router;
}
