import { gql } from 'graphql-tag';
import type { Context } from '../../context';
import type { UserTicketRecord, UserTicketType, UserTicketStatus } from './ticket';

export const typeDefs = gql`
  extend type Query {
    users(userId: UUID, nick: String, email: EmailAddress): [User!]! @auth(appIds: [TRIPBOT])
  }

  extend type Mutation {
    createUser(email: EmailAddress, password: String, discordId: String): User!
  }

  type User {
    id: ID!
    nick: String
    email: EmailAddress
    discordId: String
    tickets(
      type: [UserTicketType!],
      status: [UserTicketStatus!],
      createdAtStart: DateTime,
      createdAtEnd: DateTime
    ): [UserTicket!]!
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

export const resolvers = {
  Query: {
    async users(
      _: unknown,
      params: {
        userId?: string;
        nick?: string;
        email?: string;
      },
      { knex }: Context,
    ) {
      const sql = knex<UserRecord>('users');

      if (params.userId) sql.where('id', params.userId);
      if (params.nick) sql.whereLike('nick', `%${params.nick}%`);
      if (params.email) sql.whereLike('email', `%${params.email}%`);

      return sql;
    },
  },

  Mutation: {
    async createUser(
      _: unknown,
      params: {
        email?: string;
        password?: string;
        discordId?: string;
      },
      { knex }: Context,
    ) {
      return knex<UserRecord>('users');
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
  },
};
