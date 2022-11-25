import express, { Router } from 'express';
import PromiseRouter from 'express-promise-router';
import type { ServerDeps } from '..';

export type Route = (router: Router, deps: ServerDeps) => void;

const ROUTES: Route[] = [];

export default function createRouter(deps: ServerDeps) {
  const router = PromiseRouter();
  router.use(express.json());

  ROUTES.forEach(applyRoute => applyRoute(router, deps));

  return router;
}
