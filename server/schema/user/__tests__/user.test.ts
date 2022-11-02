import { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import createKnex, { Knex } from 'knex';
import knexConfig from '../../../../knexfile';
import createDb from '../../../db';
import createSchema from '../..';
import { uuidPattern } from '../../../../tests/patterns';
import { POSTGRES_USER, POSTGRES_DB } from '../../../../env';

let server: ApolloServer;
let knex: Knex;
beforeAll(async () => {
  server = new ApolloServer({
    schema: createSchema(),
  });

  knex = createKnex({
    ...knexConfig,
    connection: {
      ...knexConfig.connection,
      user: `${POSTGRES_USER}_test`,
      database: `${POSTGRES_DB}_test`,
    },
  });
});

afterAll(async () => knex.destroy());

describe.skip('Mutation', () => {
  describe('createUser', () => {
    test('Can create user with username', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUser($username: String!, $password: String!) {
            createUser(username: $username, password: $password) {
              id
              email
              username
              discordId
              ircId
              matrixId
              lastSeen
              joinedAt
            }
          }
        `,
        variables: {
          username: 'xXxBlazeM45terxXx',
          password: 'hunter2',
        },
      }, {
        contextValue: {
          knex,
          db: createDb(knex),
        },
      });

      expect(body.kind).toBe('single');
      expect(body).toBeUndefined();

      expect(body).toEqual({
        createUser: {
          id: expect.stringMatching(uuidPattern),
          email: null,
          username: 'xXxBlazeM45terxXx',
          discordId: null,
          ircId: null,
          matrixId: null,
          lastSeen: new Date(),
          joinedAt: new Date(),
        },
      });
    });
  });
});

test('Dummy test', () => {
  expect(true).toBe(true);
});
