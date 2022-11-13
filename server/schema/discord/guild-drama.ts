import gql from 'graphql-tag';
import type { Context } from '../../context';
import type { DiscordGuildDramaRecord } from '../../../db/discord';

export const typeDefs = gql`
  extend type Mutation {
    createDiscordGuildDrama(reportedBy: UUID!, description: String!): DiscordGuildDrama!
  }

  type DiscordGuildDrama {
    id: ID!
    reportedBy: User!
    description: String!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  Mutation: {
    async createDiscordGuildDrama(
      _: unknown,
      params: {
        reportedBy: string;
        description: string;
      },
      { db }: Context,
    ) {
      return db.knex('discordGuildDramas')
        .insert(params)
        .returning('*')
        .then(([record]) => record);
    },
  },

  DiscordGuildDrama: {
    async reportedBy(drama: DiscordGuildDramaRecord, _: unknown, { db }: Context) {
      return db.user.getById(drama.reportedBy);
    },
  },
};
