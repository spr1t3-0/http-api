import { gql } from 'graphql-tag';
import argon from 'argon2';
import type { Context } from '../../context';
import type {
  UserRecord,
  UserActionRecord,
  UserActionType,
  UserTicketRecord,
  UserTicketType,
  UserTicketStatus,
} from '../../../db/user';

export const typeDefs = gql`
  extend type Query {
    users(
      id: UUID,
      discordId: String,
      username: String,
      email: String,
    ): [User!]!
  }

  extend type Mutation {
    createUser(
      email: EmailAddress,
      password: String,
      username: String,
      discordId: String,
      ircId: String,
      matrixId: String
    ): User!
  }

  type User {
    id: ID!
    email: EmailAddress
    username: String
    ircId: String
    matrixId: String
    discord: DiscordUser
    tickets(
      type: [UserTicketType!],
      status: [UserTicketStatus!],
      createdAtStart: DateTime,
      createdAtEnd: DateTime,
    ): [UserTicket!]!
    actions: [UserAction!]!
    isFullBanned: Boolean!
    isTicketBanned: Boolean!
    isDiscordBotBanned: Boolean!
    isTimedOut: Boolean!
    lastSeen: DateTime!
    joinedAt: DateTime!
  }

  type DiscordUser {
    id: ID!
    username: String!
    discriminator: String!
    avatarUrl: URL
  }
`;

function createIsActionCheck(type: UserActionType) {
  return async (user: UserRecord, _: unknown, { db }: Context) => db.knex('userActions')
    .count('*')
    .where('userId', user.id)
    .where('type', type)
    .where((builder) => builder
      .whereNotNull('repealedAt')
      .orWhere((expiresBuilder) => expiresBuilder
        .whereNotNull('expiresat')
        .orWhere('expiresAt', '<=', db.knex.fn.now())))
    .first()
    .then(Boolean);
}

export const resolvers = {
  Query: {
    async users(
      _: unknown,
      params: {
        id: string;
        username?: string;
        email?: string;
        discordId?: string;
      },
      { db }: Context,
    ) {
      const sql = db.knex<UserRecord>('users');

      if (params.id) sql.where('id', params.id);
      if (params.discordId) sql.where('discordId', params.discordId);
      if (params.username) sql.whereLike('username', `%${params.username}%`);
      if (params.email) sql.whereLike('email', `%${params.email}%`);

      return sql;
    },
  },

  Mutation: {
    async createUser(
      _: unknown,
      { password, ...newUser }: {
        email?: string;
        password?: string;
        username?: string;
        discordId?: string;
        ircId?: string;
        matrixId?: string;
      },
      { db }: Context,
    ) {
      if (!(newUser.username || newUser.discordId || newUser.ircId || newUser.matrixId)) {
        throw new Error('Must define at least one login identifier');
      } else if ((newUser.username || newUser.ircId) && !password) {
        throw new Error('Username and password login identifiers require a password');
      }

      return db.knex<UserRecord>('users')
        .insert({
          ...newUser,
          email: newUser.email?.toLowerCase(),
          passwordHash: password && await argon.hash(password),
        })
        .returning('*')
        .then(([a]) => a);
    },
  },

  User: {
    async discord(user: UserRecord, _: unknown, { discordApi }: Context) {
      return user.discordId && discordApi.getUser(user.discordId);
    },

    async tickets(
      user: UserRecord,
      {
        type,
        status,
        createdAtStart,
        createdAtEnd,
      }: {
        type?: UserTicketType[];
        status?: UserTicketStatus[];
        createdAtStart?: string;
        createdAtEnd?: string;
      },
      { db }: Context,
    ) {
      const sql = db.knex<UserTicketRecord>('userTickets')
        .where('userId', user.id)
        .orderBy('createdAt');

      if (type?.length) sql.whereIn('type', type);
      if (status?.length) sql.whereIn('status', status);
      if (createdAtStart) sql.where('createdAt', '>=', new Date(createdAtStart));
      if (createdAtEnd) sql.where('createdAt', '<=', new Date(createdAtEnd));

      return sql;
    },

    async actions(user: UserRecord, _: unknown, { db }: Context) {
      return db.knex<UserActionRecord>('userActions')
        .where('userId', user.id)
        .orderBy('createdAt');
    },

    isFullBanned: createIsActionCheck('FULL_BAN'),
    isTicketBanned: createIsActionCheck('TICKET_BAN'),
    isDiscordBotBanned: createIsActionCheck('DISCORD_BOT_BAN'),
    isTimedOut: createIsActionCheck('TIMEOUT'),
  },
};
