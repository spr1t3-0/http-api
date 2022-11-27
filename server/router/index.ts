import express, { Router } from 'express';
import PromiseRouter from 'express-promise-router';
import { createValidator, ExpressJoiInstance } from 'express-joi-validation';
import type { ServerDeps } from '..';

export interface RouterDeps extends ServerDeps {
  validator: ExpressJoiInstance;
}

export type Route = (router: Router, deps: ServerDeps) => void;

const ROUTES: Route[] = [];

export default function createRouter(serverDeps: ServerDeps) {
  const deps: RouterDeps = {
    ...serverDeps,
    validator: createValidator(),
  };

  const router = PromiseRouter();
  router.use(express.json());

  ROUTES.forEach(applyRoute => applyRoute(router, deps));

  return router;
}
