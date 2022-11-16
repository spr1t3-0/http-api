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
beforeAll(async () => {
  knex = createTestKnex();
  server = createTestServer();
  discordApi = createDiscordApi();
  users = await getTestUsers(knex);
});

afterAll(async () => knex.destroy());

describe('Mutation', () => {
  let guildId: string;
  beforeAll(async () => {
    guildId = await knex('discordGuilds')
      .insert({
        id: 'ayyo',
        channelSanctuary: '#sanc',
      })
      .returning('id')
      .then(([{ id }]) => id);
  });

  test('createDiscordGuildDrama', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation CreateDiscordGuildDrama(
          $guildId: String!,
          $reportedBy: UUID!,
          $description: String!,
        ) {
          createDiscordGuildDrama(
            guildId: $guildId,
            reportedBy: $reportedBy,
            description: $description,
          ) {
            id
            reportedBy {
              id
              username
            }
            description
            createdAt
          }
        }
      `,
      variables: {
        guildId,
        reportedBy: users.sevenCats.id,
        description: 'Bill Cosby',
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      createDiscordGuildDrama: {
        id: expect.stringMatching(uuidPattern),
        reportedBy: {
          id: users.sevenCats.id,
          username: users.sevenCats.username,
        },
        description: 'Bill Cosby',
        createdAt: expect.any(Date),
      },
    });
  });
});
