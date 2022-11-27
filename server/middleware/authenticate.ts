import type { RequestHandler } from 'express';
import type { ServerDeps } from '..';

const BEARER_TOKEN_PATTERN = /^Bearer\s/;

export default function authToken({ config, logger }: ServerDeps): RequestHandler {
  return (req, res, next) => {
    if (!req.headers.authorization) next();
    else {
      const appId = config.findAppIdByApiToken(
        req.headers.authorization.replace(BEARER_TOKEN_PATTERN, ''),
      );
      if (!appId) {
        logger.warn('Invalid App ID:', req);
        res.sendStatus(401);
      } else {
        res.locals.appId = appId;
        next();
      }
    }
  };
}
