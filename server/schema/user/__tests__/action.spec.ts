import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
import createDiscordApi, { DiscordApi } from '../../../../discord-api';
import getTestUsers, { TestUsers } from '../../../../tests/test-users';
import { uuidPattern } from '../../../../tests/patterns';

let server: ApolloServer;
let knex: Knex;
let discordApi: DiscordApi;
let users: TestUsers;
let userActionId: string;
beforeAll(async () => {
  knex = createTestKnex();
  server = createTestServer();
  discordApi = createDiscordApi();
  users = await getTestUsers(knex);
});

afterAll(async () => knex.destroy());

describe('Mutation', () => {
  describe('createUserAction', () => {
    function defaultVariables() {
      return {
        userId: users.moonBear.id,
        type: 'NOTE',
        description: 'Wrote some tests',
        internalNote: 'Tests involve too many cats',
        expiresAt: new Date('2030-02-02'),
        createdBy: users.sevenCats.id,
      };
    }

    test('Can create a user action', async () => {
      interface Response {
        createUserAction: {
          id: string;
        };
      }

      const { body } = await server.executeOperation<Response>({
        query: gql`
          mutation CreateUserAction(
            $userId: UUID!,
            $type: UserActionType!,
            $description: String!,
            $internalNote: String!,
            $expiresAt: DateTime!,
            $createdBy: UUID!,
          ) {
            createUserAction(
              userId: $userId,
              type: $type,
              description: $description,
              internalNote: $internalNote,
              expiresAt: $expiresAt,
              createdBy: $createdBy,
            ) {
              id
              type
              banEvasionRelatedUser {
                id
              }
              description
              internalNote
              expiresAt
              repealedBy {
                id
              }
              repealedAt
              createdBy {
                id
              }
              createdAt
            }
          }
        `,
        variables: defaultVariables(),
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        createUserAction: {
          id: expect.stringMatching(uuidPattern),
          type: 'NOTE',
          banEvasionRelatedUser: null,
          description: 'Wrote some tests',
          internalNote: 'Tests involve too many cats',
          expiresAt: new Date('2030-02-02'),
          repealedBy: null,
          repealedAt: null,
          createdBy: { id: users.sevenCats.id },
          createdAt: expect.any(Date),
        },
      });

      userActionId = body.singleResult.data?.createUserAction?.id!;
    });

    test('Throws error if ben evasion user is being set while type is not BAN_EVASION', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUserAction(
            $userId: UUID!,
            $type: UserActionType!,
            $banEvasionRelatedUser: UUID!,
            $description: String!,
            $internalNote: String!,
            $expiresAt: DateTime!,
            $createdBy: UUID!,
          ) {
            createUserAction(
              userId: $userId,
              type: $type,
              banEvasionRelatedUser: $banEvasionRelatedUser,
              description: $description,
              internalNote: $internalNote,
              expiresAt: $expiresAt,
              createdBy: $createdBy,
            ) {
              id
            }
          }
        `,
        variables: {
          ...defaultVariables(),
          banEvasionRelatedUser: users.ajar.id,
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.data).toBeNull();
      expect(body.singleResult.errors).toHaveLength(1);
      expect(body.singleResult.errors?.[0]?.message)
        .toBe('Cannot set related ban evasion user if type is not BAN_EVASION');
    });

    test('Creates action when BAN_EVASION and banEvasionRelatedUser is set', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUserAction(
            $userId: UUID!,
            $type: UserActionType!,
            $banEvasionRelatedUser: UUID!,
            $description: String!,
            $internalNote: String!,
            $expiresAt: DateTime!,
            $createdBy: UUID!,
          ) {
            createUserAction(
              userId: $userId,
              type: $type,
              banEvasionRelatedUser: $banEvasionRelatedUser,
              description: $description,
              internalNote: $internalNote,
              expiresAt: $expiresAt,
              createdBy: $createdBy,
            ) {
              id
              banEvasionRelatedUser {
                id
                username
              }
            }
          }
        `,
        variables: {
          ...defaultVariables(),
          type: 'BAN_EVASION',
          banEvasionRelatedUser: users.ajar.id,
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        createUserAction: {
          id: expect.stringMatching(uuidPattern),
          banEvasionRelatedUser: {
            id: expect.stringMatching(uuidPattern),
            username: 'AJAr',
          },
        },
      });
    });
  });

  describe('updateUserAction', () => {
    test('Can successfully update action', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation UpdateUserAction(
            $id: UUID!,
            $description: String!,
            $internalNote: String!,
            $expiresAt: DateTime!,
          ) {
            updateUserAction(
              id: $id,
              description: $description,
              internalNote: $internalNote,
              expiresAt: $expiresAt,
            ) {
              id
              description
              internalNote
              expiresAt
            }
          }
        `,
        variables: {
          id: userActionId,
          description: 'updated description',
          internalNote: 'We did indeed update it',
          expiresAt: new Date('2050-03-03'),
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        updateUserAction: {
          id: userActionId,
          description: 'updated description',
          internalNote: 'We did indeed update it',
          expiresAt: new Date('2050-03-03'),
        },
      });
    });
  });

  test('repealUserAction', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation RepealUserAction($id: UUID!, $repealedBy: UUID!) {
          repealUserAction(id: $id, repealedBy: $repealedBy) {
            id
            repealedBy {
              id
            }
            repealedAt
          }
        }
      `,
      variables: {
        id: userActionId,
        repealedBy: users.ajar.id,
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      repealUserAction: {
        id: expect.stringMatching(uuidPattern),
        repealedBy: { id: users.ajar.id },
        repealedAt: expect.any(Date),
      },
    });
  });

  test('deleteUserAction', async () => {
    async function exists() {
      return knex('userActions')
        .where('id', userActionId)
        .first()
        .then(Boolean);
    }

    await expect(exists()).resolves.toBe(true);

    const { body } = await server.executeOperation({
      query: gql`
        mutation DeleteUserAction($id: UUID!) {
          deleteUserAction(id: $id)
        }
      `,
      variables: { id: userActionId },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({ deleteUserAction: null });

    await expect(exists()).resolves.toBe(false);
  });
});

describe('UserAction', () => {
  beforeAll(async () => {
    userActionId = await knex('userActions')
      .insert({
        userId: users.moonBear.id,
        createdBy: users.sevenCats.id,
        banEvasionRelatedUser: users.ajar.id,
        type: 'BAN_EVASION',
        description: 'fly guy again',
        internalNote: 'Indeed does fly',
      })
      .returning('id')
      .then(([record]) => record.id);
  });

  test('banEvasionRelatedUser', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        query BanEvasionRelatedUser($id: UUID!) {
          userActions(id: $id) {
            id
            banEvasionRelatedUser {
              id
            }
          }
        }
      `,
      variables: { id: userActionId },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      userActions: [{
        id: userActionId,
        banEvasionRelatedUser: { id: users.ajar.id },
      }],
    });
  });

  test('repealedBy', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation RepealUserAction($id: UUID!, $repealedBy: UUID!) {
          repealUserAction(id: $id, repealedBy: $repealedBy) {
            repealedBy {
              id
            }
          }
        }
      `,
      variables: {
        id: userActionId,
        repealedBy: users.ajar.id,
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      repealUserAction: {
        repealedBy: { id: users.ajar.id },
      },
    });
  });

  test('createdBy', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        query UserActionCreatedBy($id: UUID!) {
          userActions(id: $id) {
            createdBy {
              id
            }
          }
        }
      `,
      variables: { id: userActionId },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      userActions: [{
        createdBy: { id: users.sevenCats.id },
      }],
    });
  });
});
