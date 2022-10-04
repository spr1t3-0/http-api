'use strict';

const http = require('http');
const { ApolloServer } = require('apollo-server-express');
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} = require('apollo-server-core');
const { HTTP_PORT } = require('../../env');

module.exports = async function applyApollo(app, deps) {
  const { logger } = deps;
  const httpServer = http.createServer(app);

  const apolloServer = new ApolloServer({
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginDrainHttpServer,
      ApolloServerPluginLandingPageLocalDefault,
    ],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  return new Promise(resolve => {
    httpServer.listen({ port: HTTP_PORT }, ({ url }) => {
      logger.info(`TripSit API listening: ${url}`);
      resolve(apolloServer);
    });
  });
};
