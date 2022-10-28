'use strict';

const http = require('http');
const { ApolloServer } = require('apollo-server-express');
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} = require('apollo-server-core');
const dataSources = require('./data-sources');
const createSchema = require('./schema');
const { HTTP_PORT } = require('../../env');

module.exports = async function applyApollo(app, deps) {
  const { logger } = deps;
  const httpServer = http.createServer(app);

  const apolloServer = new ApolloServer({
    dataSources: () => dataSources(deps),
    schema: createSchema(),
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  return new Promise(resolve => {
    httpServer.listen({ port: HTTP_PORT }, () => {
      logger.info('TripSit API listening!');
      resolve(apolloServer);
    });
  });
};
