import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
import createDiscordApi, { DiscordApi } from '../../../../discord-api';

let server: ApolloServer;
let knex: Knex;
let discordApi: DiscordApi;
beforeAll(() => {
  knex = createTestKnex();
  server = createTestServer();
  discordApi = createDiscordApi();
});

afterAll(async () => knex.destroy());

describe('Mutation', () => {
  test('createDiscordGuild', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation CreateDiscordGuild(
          $id: String!,
          $maxOnlineMembers: UnsignedInt,
          $channels: DiscordGuildChannels,
          $roles: DiscordGuildRoles,
        ) {
          createDiscordGuild(
            id: $id,
            maxOnlineMembers: $maxOnlineMembers,
            channels: $channels,
            roles: $roles,
          ) {
            id
            isBanned
            maxOnlineMembers
            channelSanctuary
            channelGeneral
            channelTripsit
            channelTripsitMeta
            channelApplications
            roleNeedsHelp
            roleTripsitter
            roleHelper
            roleTechHelp
            removedAt
            createdAt
          }
        }
      `,
      variables: {
        id: 'mockDiscordGuildId',
        maxOnlineMembers: 400,
        channels: {
          channelSanctuary: '#peace',
          channelTripsit: '#sos',
          channelApplications: '#sign-up',
        },
        roles: {
          roleNeedsHelp: 'plzhalp',
          roleHelper: 'halper',
          roleTechHelp: 'fuck-active-directory',
        },
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      createDiscordGuild: {
        id: 'mockDiscordGuildId',
        isBanned: false,
        maxOnlineMembers: 400,
        channelSanctuary: '#peace',
        channelGeneral: null,
        channelTripsit: '#sos',
        channelTripsitMeta: null,
        channelApplications: '#sign-up',
        roleNeedsHelp: 'plzhalp',
        roleTripsitter: null,
        roleHelper: 'halper',
        roleTechHelp: 'fuck-active-directory',
        removedAt: null,
        createdAt: expect.any(Date),
      },
    });
  });

  test('updateDiscordGuild', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation UpdateDiscordGuild(
          $id: String!,
          $isBanned: Boolean,
          $maxOnlineMembers: UnsignedInt,
          $channels: DiscordGuildChannels,
          $roles: DiscordGuildRoles,
        ) {
          updateDiscordGuild(
            id: $id,
            isBanned: $isBanned,
            maxOnlineMembers: $maxOnlineMembers,
            channels: $channels,
            roles: $roles,
          ) {
            id
            isBanned
            maxOnlineMembers
            channelSanctuary
            channelGeneral
            channelTripsit
            channelTripsitMeta
            channelApplications
            roleNeedsHelp
            roleTripsitter
            roleHelper
            roleTechHelp
            removedAt
            createdAt
          }
        }
      `,
      variables: {
        id: 'mockDiscordGuildId',
        isBanned: true,
        maxOnlineMembers: 20,
        channels: {
          channelGeneral: '#ayyo',
        },
        roles: {
          roleTechHelp: null,
        },
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      updateDiscordGuild: {
        id: 'mockDiscordGuildId',
        isBanned: true,
        maxOnlineMembers: 20,
        channelSanctuary: '#peace',
        channelGeneral: '#ayyo',
        channelTripsit: '#sos',
        channelTripsitMeta: null,
        channelApplications: '#sign-up',
        roleNeedsHelp: 'plzhalp',
        roleTripsitter: null,
        roleHelper: 'halper',
        roleTechHelp: null,
        removedAt: null,
        createdAt: expect.any(Date),
      },
    });
  });

  test('removeDiscordGuild', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation RemoveDiscordGuild($id: String!) {
          removeDiscordGuild(id: $id) {
            id
            removedAt
          }
        }
      `,
      variables: {
        id: 'mockDiscordGuildId',
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      removeDiscordGuild: {
        id: 'mockDiscordGuildId',
        removedAt: expect.any(Date),
      },
    });
  });
});
