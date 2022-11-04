import gql from 'graphql-tag';
import type { Context } from '../../context';

export const typeDefs = gql`
  extend type Mutation {
    createUserTicket(userId: UUID!, type: UserTicketType!, description: String): UserTicket!

    updateUserTicket(
      userTicketId: UUID!,
      type: UserTicketType,
      status: UserTicketStatus,
      description: String,
    ): UserTicket!
  }

  type UserTicket {
    id: ID!
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
      { userTicketId, ...updates }: {
        userTicketId: string;
        type?: UserTicketType;
        status?: UserTicketStatus;
        description?: string;
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
};
