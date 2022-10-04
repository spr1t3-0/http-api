'use strict';

const { NODE_ENV } = require('../../env');

module.exports = function errorHandler({ logger }) {
  return (ex, req, res, next) => {
    if (res.headersSent) next(ex);
    else {
      logger.error('Internal server error:', ex);
      if (NODE_ENV !== 'production') res.status(500).json(ex);
      else res.sendStatus(500);
    }
  };
};
