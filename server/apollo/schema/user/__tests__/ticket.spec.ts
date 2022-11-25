import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../../tests/test-server';
import createDiscordApi, { DiscordApi } from '../../../../../discord-api';
import getTestUsers, { TestUsers } from '../../../../../tests/test-users';
import { uuidPattern } from '../../../../../tests/patterns';

let server: ApolloServer;
let knex: Knex;
let discordApi: DiscordApi;
let users: TestUsers;
beforeAll(async () => {
  knex = createTestKnex();
  server = createTestServer();
  discordApi = createDiscordApi();
  users = await getTestUsers(knex);
});

afterAll(async () => knex.destroy());

describe('Mutation', () => {
  let ticketId: string;

  test('createUserTicket', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation CreateUserTicket(
          $userId: UUID!,
          $type: UserTicketType!,
          $description: String,
          $threadId: String!,
          $firstMessageId: String!,
        ) {
          createUserTicket(
            userId: $userId,
            type: $type,
            description: $description,
            threadId: $threadId,
            firstMessageId: $firstMessageId,
          ) {
            id
            type
            status
            description
            threadId
            firstMessageId
            closedAt
            createdAt
          }
        }
      `,
      variables: {
        userId: users.moonBear.id,
        type: 'TRIPSIT',
        description: 'Help, I\'ve fallen and I can\'t get up!',
        threadId: 'mockThreadId',
        firstMessageId: 'mockFirstMessageId',
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      createUserTicket: {
        id: expect.stringMatching(uuidPattern),
        type: 'TRIPSIT',
        status: 'OPEN',
        description: 'Help, I\'ve fallen and I can\'t get up!',
        threadId: 'mockThreadId',
        firstMessageId: 'mockFirstMessageId',
        closedAt: null,
        createdAt: expect.any(Date),
      },
    });

    ticketId = (body.singleResult.data?.createUserTicket as { id: string }).id;
  });

  test('updateUserTicket', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation UpdateUserTicket($id: UUID!, $description: String) {
          updateUserTicket(id: $id, description: $description) {
            id
            description
          }
        }
      `,
      variables: {
        id: ticketId,
        description: 'My Acorn chair lift is broken',
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      updateUserTicket: {
        id: ticketId,
        description: 'My Acorn chair lift is broken',
      },
    });
  });
});
