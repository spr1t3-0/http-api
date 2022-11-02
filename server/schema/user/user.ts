import { gql } from 'graphql-tag';
import argon from 'argon2';
import type { Context } from '../../context';
import type { UserActionRecord, UserActionType } from './action';
import type { UserTicketRecord, UserTicketType, UserTicketStatus } from './ticket';

export const typeDefs = gql`
  extend type Query {
    users(userId: UUID, nick: String, email: EmailAddress): [User!]! @auth(appIds: [TRIPBOT])
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
    discordId: String
    ircId: String
    matrixId: String
    tickets(
      type: [UserTicketType!],
      status: [UserTicketStatus!],
      createdAtStart: DateTime,
      createdAtEnd: DateTime
    ): [UserTicket!]!
    actions: [UserAction!]!
    isFullBanned: Boolean!
    isTicketBanned: Boolean!
    isDiscordBotBanned: Boolean!
    isTimedOut: Boolean!
    lastSeen: DateTime!
    joinedAt: DateTime!
  }
`;

export interface UserRecord {
  id: string;
  email?: string;
  nick?: string;
  passwordHash?: string;
  discordId?: string;
  timezone: string;
  birthday: Date;
  karmaGiven: number;
  karmaReceived: number;
  sparklePoints: number;
  discordBotBan: boolean;
  ticketBan: boolean;
  lastSeen: Date;
  joinedAt: Date;
}

function createIsActionCheck(type: UserActionType) {
  return async (user: UserRecord, _: unknown, { knex }: Context) => knex('userActions')
    .count('*')
    .where('userId', user.id)
    .where('type', type)
    .where((builder) => builder
      .whereNotNull('repealedAt')
      .orWhere((expiresBuilder) => expiresBuilder
        .whereNotNull('expiresat')
        .orWhere('expiresAt', '<=', knex.fn.now())))
    .first()
    .then(Boolean);
}

export const resolvers = {
  Query: {
    async users(
      _: unknown,
      { userId, nick, email }: {
        userId?: string;
        nick?: string;
        email?: string;
      },
      { knex }: Context,
    ) {
      const sql = knex<UserRecord>('users');

      if (userId) sql.where('id', userId);
      if (nick) sql.whereLike('nick', `%${nick}%`);
      if (email) sql.whereLike('email', `%${email}%`);

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
      { knex }: Context,
    ) {
      if (!(newUser.username || newUser.discordId || newUser.ircId || newUser.matrixId)) {
        throw new Error('Must define at least one login identifier');
      } else if ((newUser.username || newUser.ircId) && !password) {
        throw new Error('Username and password login identifiers require a password');
      }

      return knex<UserRecord>('users')
        .insert({
          ...newUser,
          passwordHash: password && await argon.hash(password),
        })
        .returning('*')
        .then(([a]) => a);
    },
  },

  User: {
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
      { knex }: Context,
    ) {
      const sql = knex<UserTicketRecord>('userTickets')
        .where('userId', user.id)
        .orderBy('createdAt');

      if (type?.length) sql.whereIn('type', type);
      if (status?.length) sql.whereIn('status', status);
      if (createdAtStart) sql.where('createdAt', '>=', new Date(createdAtStart));
      if (createdAtEnd) sql.where('createdAt', '<=', new Date(createdAtEnd));

      return sql;
    },

    async actions(user: UserRecord, _: unknown, { knex }: Context) {
      return knex<UserActionRecord>('userActions')
        .where('userId', user.id)
        .orderBy('createdAt');
    },

    isFullBanned: createIsActionCheck('FULL_BAN'),
    isTicketBanned: createIsActionCheck('TICKET_BAN'),
    isDiscordBotBanned: createIsActionCheck('DISCORD_BOT_BAN'),
    isTimedOut: createIsActionCheck('TIMEOUT'),
  },
};
