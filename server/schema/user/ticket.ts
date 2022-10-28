import gql from 'graphql-tag';
import type { Context } from '../../context';

export const typeDefs = gql`
  extend type Mutation {
    createUserTicket(userId: UUID!, type: UserTicketType!, description: String): UserTicket!
    updateUserTicket(userTicketId: UUID!, updates: UserTicketUpdates!): UserTicket!
  }

  input UserTicketUpdates {
    type: UserTicketType
    status: UserTicketStatus
    description: String
  }

  type UserTicket {
    id: ID!
    user: User!
    type: UserTicketType!
    status: UserTicketStatus!
    description: String!
    threadId: String!
    firstMessageId: String!
    closedAt: DateTime
    createdAt: DateTime!
  }

  enum UserTicketType {
    APPEAL
    TRIPSIT
    TECH
    FEEDBACK
  }

  enum UserTicketStatus {
    OPEN
    CLOSED
    BLOCKED
    PAUSED
  }
`;

export type UserTicketType = 'APPEAL' | 'TRIPSIT' | 'TECH' | 'FEEDBACK';
export type UserTicketStatus = 'OPEN' | 'CLOSED' | 'BLOCKED' | 'PAUSED';
export interface UserTicketRecord {
  id: string;
  userId: string;
  type: UserTicketType;
  status: UserTicketStatus;
  description?: string;
  threadId: string;
  firstMessageId: string;
  closedAt?: Date;
  createdAt: Date;
}

export const resolvers = {
  Query: {},

  Mutation: {
    async createUserTicket(
      _: unknown,
      newTicket: Pick<UserTicketRecord, 'userId' | 'type' | 'description'>,
      { knex }: Context,
    ) {
      return knex<UserTicketRecord>('userTickets')
        .insert(newTicket)
        .returning('*')
        .then(([a]) => a);
    },

    async updateUserTicket(
      _: unknown,
      { userTicketId, updates }: {
        userTicketId: string;
        updates: {
          type?: UserTicketType;
          status?: UserTicketStatus;
          description?: string;
        },
      },
      { knex }: Context,
    ) {
      return knex.transaction(async (trx) => {
        await trx('userTickets')
          .where('id', userTicketId)
          .update(updates);

        return trx<UserTicketRecord>('userTickets')
          .where('id', userTicketId)
          .first();
      });
    },
  },

  UserTicket: {
    async user(userTicket: UserTicketRecord, _: unknown, { knex }: Context) {
      return knex('users')
        .where('id', userTicket.userId)
        .first();
    },
  },
};
