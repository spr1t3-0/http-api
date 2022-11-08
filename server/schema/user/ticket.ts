import gql from 'graphql-tag';
import type { Context } from '../../context';
import type { UserTicketRecord, UserTicketStatus, UserTicketType } from '../../../db/user';

export const typeDefs = gql`
  extend type Mutation {
    createUserTicket(
      userId: UUID!,
      type: UserTicketType!,
      description: String,
      threadId: String!,
      firstMessageId: String!,
    ): UserTicket!

    updateUserTicket(id: UUID!, description: String): UserTicket!
    # updateUserTicketStatus(id: UUID!, status: UserTicketStatus!): UserTicket!
  }

  type UserTicket {
    id: ID!
    type: UserTicketType!
    status: UserTicketStatus!
    description: String!
    threadId: String
    firstMessageId: String
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

export const resolvers = {
  Mutation: {
    async createUserTicket(
      _: unknown,
      newTicket: Pick<UserTicketRecord, 'userId' | 'type' | 'description'>,
      { db }: Context,
    ) {
      return db.knex<UserTicketRecord>('userTickets')
        .insert(newTicket)
        .returning('*')
        .then(([a]) => a);
    },

    async updateUserTicket(
      _: unknown,
      { id, ...updates }: {
        id: string;
        type?: UserTicketType;
        status?: UserTicketStatus;
        description?: string;
      },
      { db }: Context,
    ) {
      return db.knex.transaction(async (trx) => {
        await trx('userTickets').where('id', id).update(updates);
        return trx<UserTicketRecord>('userTickets').where('id', id).first();
      });
    },

    // async updateUserTicketStatus(
    //   _: unknown,
    //   { id, status }: {
    //     id: string;
    //     status: UserTicketStatus;
    //   },
    //   { db }: Context,
    // ) {
    //   const currentStatus = await db.knex<UserTicketRecord>('userTickets')
    //     .where('id', id)
    //     .select('status')
    //     .first()
    //     .then((ticket) => ticket?.status);

    //   if (!currentStatus) throw new Error('Ticket not found');
    //   if (currentStatus === 'CLOSED') {
    //     throw new Error('Tickets may not change their status from CLOSED');
    //   }

    //   return db.knex.transaction(async (trx) => {
    //     const currentType = trx('user');
    //   });
    // },
  },
};
