import type { Server } from 'node:http';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import createSchema from './schema';
import applyDirectives from './directives';
import type { Context } from '../context';

export default function createServer(httpServer: Server) {
  return new ApolloServer<Context>({
    schema: applyDirectives(createSchema()),
    csrfPrevention: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
  });
}
