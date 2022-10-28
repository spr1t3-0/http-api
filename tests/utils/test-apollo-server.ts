import { ApolloServer } from '@apollo/server';
import createSchema from '../../server/schema';

export default function createTestApolloServer() {
  return new ApolloServer({
    schema: createSchema(),
    csrfPrevention: true,
  });
}
