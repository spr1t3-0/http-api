import type { ErrorRequestHandler } from 'express';
import type { ServerDeps } from '..';
import { NODE_ENV } from '../../env';

export default function errorHandler({ logger }: ServerDeps): ErrorRequestHandler {
  return (ex, req, res, next) => {
    console.log(res);
    if (res.headersSent) next(ex);
    else {
      logger.error(ex);
      if (NODE_ENV === 'production') res.sendStatus(500);
      else res.status(500).json(ex);
    }
  };
}
