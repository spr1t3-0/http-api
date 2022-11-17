import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import argon from 'argon2';
import createTestKnex from '../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
import createDiscordApi, { DiscordApi } from '../../../../discord-api';
import { uuidPattern } from '../../../../tests/patterns';

let server: ApolloServer;
let knex: Knex;
let discordApi: DiscordApi;
beforeAll(() => {
  knex = createTestKnex();
  server = createTestServer();
  discordApi = createDiscordApi();
});

afterAll(async () => knex.destroy());

describe('Query', () => {
  describe('users', () => {
    interface PartialRecord {
      id: string;
      username: string;
      email: string;
      passwordHash: string;
    }

    let testUserId: string;
    let similarTestUserId: string;
    beforeAll(async () => {
      [testUserId, similarTestUserId] = await Promise.all([
        knex<PartialRecord>('users').insert({
          username: 'ChakraMasterJake',
          email: 'hacker@evil.org',
          passwordHash: await argon.hash('bad password'),
        }),
        knex<PartialRecord>('users').insert({
          username: 'ChiMasterDavid',
          email: 'fracker@evil.org',
          passwordHash: await argon.hash('hunter2'),
        }),
      ]
        .map((sql) => sql.returning('id')))
        .then((records) => records.map(([{ id }]) => id));
    });

    test('Can get a user by their ID', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query GetUserById($id: UUID!) {
            users(id: $id) {
              id
              username
            }
          }
        `,
        variables: { id: testUserId },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        users: [{
          id: testUserId,
          username: 'ChakraMasterJake',
        }],
      });
    });

    test('Can search for a user by their username', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query GetUserByUsername($username: String!) {
            users(username: $username) {
              id
              username
            }
          }
        `,
        variables: { username: 'Master' },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        users: [
          {
            id: testUserId,
            username: 'ChakraMasterJake',
          },
          {
            id: similarTestUserId,
            username: 'ChiMasterDavid',
          },
        ],
      });
    });

    test('Can search for a user by their email', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query GetUserByEmail($email: String!) {
            users(email: $email) {
              id
              email
            }
          }
        `,
        variables: { email: 'acke' },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        users: [
          {
            id: testUserId,
            email: 'hacker@evil.org',
          },
          {
            id: similarTestUserId,
            email: 'fracker@evil.org',
          },
        ],
      });
    });
  });
});

describe('Mutation', () => {
  describe('createUser', () => {
    test('Must use a password when creating a user via a username', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUserWithUsername($username: String!) {
            createUser(username: $username) {
              id
              username
            }
          }
        `,
        variables: { username: 'MediumPump' },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.data).toBeNull();
      expect(body.singleResult.errors).toHaveLength(1);
      expect(body.singleResult.errors?.[0]?.message)
        .toBe('Username and password login identifiers require a password');
    });

    test('Can create a user when provided with a username and password', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUserWithUsername($username: String!, $password: String!) {
            createUser(username: $username, password: $password) {
              id
              username
            }
          }
        `,
        variables: {
          username: 'MediumPump',
          password: 'top secret',
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        createUser: {
          id: expect.stringMatching(uuidPattern),
          username: 'MediumPump',
        },
      });
    });

    test('Can create a user with a discordId', async () => {
      const mockDiscordApi = ({
        getUser: jest.fn().mockResolvedValue({
          id: 'mockDiscordId',
          username: 'mockDiscordUsername',
          discriminator: 'mockDiscriminator',
          avatarUrl: 'https://example.com/foo.png',
        }),
      } as unknown) as DiscordApi;

      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUserWithDiscordId($discordId: String!) {
            createUser(discordId: $discordId) {
              id
              discord {
                id
                username
                discriminator
                avatarUrl
              }
            }
          }
        `,
        variables: { discordId: 'mockDiscordId' },
      }, {
        contextValue: await createTestContext(knex, mockDiscordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        createUser: {
          id: expect.stringMatching(uuidPattern),
          discord: {
            id: 'mockDiscordId',
            username: 'mockDiscordUsername',
            discriminator: 'mockDiscriminator',
            avatarUrl: 'https://example.com/foo.png',
          },
        },
      });
    });

    test('Can create a user with a matrixId', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUserWithMatrixId($matrixId: String!) {
            createUser(matrixId: $matrixId) {
              id
              matrixId
            }
          }
        `,
        variables: { matrixId: 'mockMatrixId' },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        createUser: {
          id: expect.stringMatching(uuidPattern),
          matrixId: 'mockMatrixId',
        },
      });
    });

    test('Creating a user with an ircId requires a password', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUserWithIrcId($ircId: String!) {
            createUser(ircId: $ircId) {
              id
              ircId
            }
          }
        `,
        variables: { ircId: 'mockIrcId' },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.data).toBeNull();
      expect(body.singleResult.errors).toHaveLength(1);
      expect(body.singleResult.errors?.[0]?.message)
        .toBe('Username and password login identifiers require a password');
    });

    test('Creating a user with an ircId and password', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUserWithIrcId($ircId: String!, $password: String!) {
            createUser(ircId: $ircId, password: $password) {
              id
              ircId
            }
          }
        `,
        variables: {
          ircId: 'mockIrcId',
          password: 'P@ssw0rd',
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        createUser: {
          id: expect.stringMatching(uuidPattern),
          ircId: 'mockIrcId',
        },
      });
    });
  });
});
