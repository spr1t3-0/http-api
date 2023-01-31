import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import argon from 'argon2';
import createTestKnex from '../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
import createDiscordApi, { DiscordApi } from '../../../../discord-api';
import getTestUsers, { TestUsers } from '../../../../tests/test-users';
import { uuidPattern } from '../../../../tests/patterns';

jest.mock('../../../../discord-api');

let server: ApolloServer;
let knex: Knex;
let discordApi: DiscordApi;
let testUsers: TestUsers;
beforeAll(async () => {
  knex = createTestKnex();
  server = createTestServer();
  discordApi = createDiscordApi();
  testUsers = await getTestUsers(knex);
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
        .map(sql => sql.returning('id')))
        .then(records => records.map(([{ id }]) => id));
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

    test('Can search for a user by Discord ID', async () => {
      (discordApi.getUser as jest.Mock).mockResolvedValue({
        id: testUsers.sevenCats.discordId,
        username: 'SevenCats',
        discriminator: '1203',
        avatarUrl: 'https://example.com/discord-avatar-url',
      });

      const { body } = await server.executeOperation({
        query: gql`
          query GetUserByDiscordId($discordId: String!) {
            users(discordId: $discordId) {
              id
              discord {
                id
              }
            }
          }
        `,
        variables: {
          discordId: 'sevencatsDiscordId',
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        users: [{
          id: testUsers.sevenCats.id,
          discord: {
            id: 'sevencatsDiscordId',
          },
        }],
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

describe('User', () => {
  test('discord', async () => {
    (discordApi.getUser as jest.Mock).mockResolvedValue({
      id: testUsers.sevenCats.discordId,
      username: 'SevenCats',
      discriminator: '1203',
      avatarUrl: 'https://example.com/discord-avatar-url',
    });

    const { body } = await server.executeOperation({
      query: gql`
        query UserDiscord($id: UUID!) {
          users(id: $id) {
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
      variables: {
        id: testUsers.sevenCats.id,
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      users: [{
        id: testUsers.sevenCats.id,
        discord: {
          id: 'sevencatsDiscordId',
          username: 'SevenCats',
          discriminator: '1203',
          avatarUrl: 'https://example.com/discord-avatar-url',
        },
      }],
    });
  });

  test('actions', async () => {
    await knex('userActions')
      .where('userId', testUsers.ajar.id)
      .del();

    const userActionId = await knex('userActions')
      .insert({
        userId: testUsers.ajar.id,
        createdBy: testUsers.moonBear.id,
        type: 'NOTE',
        description: 'Is a rad dude',
      })
      .returning('id')
      .then(([record]) => record.id);

    const { body } = await server.executeOperation({
      query: gql`
        query UserActions($id: UUID!) {
          users(id: $id) {
            id
            actions {
              id
              type
              description
            }
          }
        }
      `,
      variables: {
        id: testUsers.ajar.id,
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      users: [{
        id: testUsers.ajar.id,
        actions: [{
          id: userActionId,
          type: 'NOTE',
          description: 'Is a rad dude',
        }],
      }],
    });
  });

  describe('tickets', () => {
    let ticketIds: string[];
    beforeAll(async () => {
      await knex('userTickets')
        .whereIn('id', [testUsers.moonBear.id, testUsers.sevenCats.id])
        .del();

      ticketIds = await knex('userTickets')
        .insert([
          {
            userId: testUsers.moonBear.id,
            type: 'APPEAL',
            description: 'I was drunk',
            threadId: '1111',
            firstMessageId: '1111',

          },
          {
            userId: testUsers.moonBear.id,
            type: 'APPEAL',
            description: 'I was on PCP',
            threadId: '2222',
            firstMessageId: '1111',
          },
          {
            userId: testUsers.moonBear.id,
            type: 'TRIPSIT',
            description: 'High AF on nutmeg send help',
            threadId: '3333',
            firstMessageId: '1111',
          },
          {
            userId: testUsers.sevenCats.id,
            type: 'TRIPSIT',
            description: 'Smoking ranch, when will I be sober?',
            threadId: '4444',
            firstMessageId: '1111',
          },
        ])
        .returning('id')
        .then(records => records.map(record => record.id));
    });

    afterAll(async () => {
      await knex('userTickets')
        .whereIn('id', [testUsers.moonBear.id, testUsers.sevenCats.id])
        .del();
    });

    test('Gets all tickest for a user', async () => {
      const query = gql`
        query UserTickets($id: UUID!) {
          users(id: $id) {
            id
            tickets {
              id
              type
              status
              description
              threadId
            }
          }
        }
      `;

      const [moonBearBody, sevenCatsBody] = await Promise.all([
        testUsers.moonBear.id,
        testUsers.sevenCats.id,
      ]
        .map(id => createTestContext(knex, discordApi)
          .then(contextValue => server.executeOperation({
            query,
            variables: { id },
          }, { contextValue }))))
        .then(responses => responses.map(response => response.body));

      assert(moonBearBody.kind === 'single');
      assert(sevenCatsBody.kind === 'single');
      expect(moonBearBody.singleResult.errors).toBeUndefined();
      expect(sevenCatsBody.singleResult.errors).toBeUndefined();

      expect(moonBearBody.singleResult.data).toEqual({
        users: [{
          id: testUsers.moonBear.id,
          tickets: [
            {
              id: ticketIds.at(0),
              type: 'APPEAL',
              status: 'OPEN',
              description: 'I was drunk',
              threadId: '1111',
            },
            {
              id: ticketIds.at(1),
              type: 'APPEAL',
              status: 'OPEN',
              description: 'I was on PCP',
              threadId: '2222',
            },
            {
              id: ticketIds.at(2),
              type: 'TRIPSIT',
              status: 'OPEN',
              description: 'High AF on nutmeg send help',
              threadId: '3333',
            },
          ],
        }],
      });

      expect(sevenCatsBody.singleResult.data).toEqual({
        users: [{
          id: testUsers.sevenCats.id,
          tickets: [{
            id: ticketIds.at(3),
            type: 'TRIPSIT',
            status: 'OPEN',
            description: 'Smoking ranch, when will I be sober?',
            threadId: '4444',
          }],
        }],
      });
    });

    // TODO: Parameters for tickets
  });
});
