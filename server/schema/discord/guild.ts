import gql from 'graphql-tag';
import { DiscordGuildRecord } from '../../../db/discord';
import type { Context } from '../../context';

export const typeDefs = gql`
  extend type Mutation {
    createDiscordGuild(
      id: String!,
      maxOnlineMembers: UnsignedInt,
      channels: DiscordGuildChannels,
      roles: DiscordGuildRoles,
    ): DiscordGuild!

    updateDiscordGuild(
      id: String!,
      isBanned: Boolean,
      maxOnlineMembers: UnsignedInt,
      channels: DiscordGuildChannels,
      roles: DiscordGuildRoles,
    ): DiscordGuild!

    removeDiscordGuild(id: String!): DiscordGuild!
  }

  type DiscordGuild {
    id: ID!
    isBanned: Boolean!
    maxOnlineMembers: UnsignedInt
    channelSanctuary: String
    channelGeneral: String
    channelTripsit: String
    channelTripsitMeta: String
    channelApplications: String
    roleNeedsHelp: String
    roleTripsitter: String
    roleHelper: String
    roleTechHelp: String
    removedAt: DateTime
    createdAt: DateTime!
  }

  input DiscordGuildChannels {
    channelSanctuary: String
    channelGeneral: String
    channelTripsit: String
    channelTripsitMeta: String
    channelApplications: String
  }

  input DiscordGuildRoles {
    roleNeedsHelp: String
    roleTripsitter: String
    roleHelper: String
    roleTechHelp: String
  }
`;

interface GuildCreateParams {
  id: string;
  maxOnlineMembers?: number;
  channels?: {
    channelSanctuary?: string;
    channelGeneral?: string;
    channelTripsit?: string;
    channelTripsitMeta?: string;
    channelApplications?: string;
  };
  roles?: {
    roleNeedsHelp?: String;
    roleTripsitter?: String;
    roleHelper?: String;
    roleTechHelp?: String;
  };
}

interface GuildUpdateParams extends GuildCreateParams {
  isBanned?: boolean;
}

export const resolvers = {
  Mutation: {
    async createDiscordGuild(_: unknown, params: GuildCreateParams, { db }: Context) {
      return db.knex<DiscordGuildRecord>('discordGuilds')
        .insert({
          ...params.channels,
          ...params.roles,
          id: params.id,
          maxOnlineMembers: params.maxOnlineMembers,
        })
        .returning('*')
        .then(([record]) => record);
    },

    async updateDiscordGuild(_: unknown, params: GuildUpdateParams, { db }: Context) {
      return db.knex.transaction(async (trx) => {
        const updateSql = trx('discordGuilds').where('id', params.id);
        if (params.isBanned) updateSql.update('isBanned', params.isBanned);
        if (params.maxOnlineMembers) updateSql.update('maxOnlineMembers', params.maxOnlineMembers);

        Object.entries(params.roles || {})
          .concat(Object.entries(params.channels || {}))
          .forEach(([k, v]) => updateSql.update(k, v));

        await updateSql;
        return trx<DiscordGuildRecord>('discordGuilds')
          .where('id', params.id)
          .first();
      });
    },

    async removeDiscordGuild(_: unknown, { id }: { id: string }, { db }: Context) {
      const record = await db.knex<DiscordGuildRecord>('discordGuilds')
        .where('id', id)
        .select('removedAt')
        .first();

      if (!record) throw new Error('Guild does not exist');
      if (record.removedAt) throw new Error('Guild is already removed');

      return db.knex.transaction(async (trx) => {
        await trx('discordGuilds')
          .where('id', id)
          .update({ removedAt: db.knex.fn.now() });

        return trx<DiscordGuildRecord>('discordGuilds')
          .where('id', id)
          .first();
      });
    },
  },
};
