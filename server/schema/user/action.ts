import gql from 'graphql-tag';
import type { Context } from '../../context';
import type { UserActionRecord, UserActionType } from '../../../db/user';

export const typeDefs = gql`
  extend type Query {
    userActions(id: UUID): [UserAction!]!
  }

  extend type Mutation {
    createUserAction(
      userId: UUID!,
      type: UserActionType!,
      banEvasionRelatedUser: UUID,
      description: String!,
      internalNote: String,
      expiresAt: DateTime,
      createdBy: UUID!,
    ): UserAction!

    updateUserAction(
      id: UUID!,
      description: String,
      internalNote: String,
      expiresAt: DateTime,
    ): UserAction!

    repealUserAction(id: UUID!, repealedBy: UUID!): UserAction!
    deleteUserAction(id: UUID!): Void
  }

  type UserAction {
    id: ID!
    type: UserActionType!
    banEvasionRelatedUser: User
    description: String!
    internalNote: String
    expiresAt: DateTime
    repealedBy: User
    repealedAt: DateTime
    createdBy: User!
    createdAt: DateTime!
  }

  enum UserActionType {
    NOTE
    WARNING
    FULL_BAN
    TICKET_BAN
    DISCORD_BOT_BAN
    BAN_EVASION
    UNDERBAN
    TIMEOUT
    REPORT
    KICK
  }
`;

interface BanEvasionCheckBaseParams {
  id?: string;
  type?: UserActionType;
  banEvasionRelatedUser?: string;
}

type ActionWrite<Params> = (
  root: unknown,
  params: Params,
  ctx: Context,
) => Promise<UserActionRecord>;

function withBanEvasionCheck<Params extends BanEvasionCheckBaseParams>(
  fn: ActionWrite<Params>,
): ActionWrite<Params> {
  return async (root, params, ctx) => {
    const type = params?.type || (!params?.id ? null : await ctx.db.knex<UserActionRecord>('userActions')
      .select('type')
      .where('id', params?.id)
      .first()
      .then(action => action?.type));

    if (type !== 'BAN_EVASION' && params?.banEvasionRelatedUser) {
      throw new Error('Cannot set related ban evasion user if type is not BAN_EVASION');
    }

    return fn(root, params, ctx);
  };
}

export const resolvers = {
  Query: {
    async userActions(_: unknown, params: { id?: string }, { db }: Context) {
      const sql = db.knex('userActions')
        .orderBy('createdAt');

      if (params.id) sql.where('id', params.id);
      return sql;
    },
  },

  Mutation: {
    createUserAction: withBanEvasionCheck<{
      userId: string;
      type: UserActionType;
      description: string;
      banEvasionRelatedUser?: string;
      internalNote?: string;
      createdBy: string;
    }>(async (_, newUserAction, { db }) => db.knex<UserActionRecord>('userActions')
      .insert(newUserAction)
      .returning('*')
      .then(([a]) => a)),

    updateUserAction: withBanEvasionCheck(async (_, { id, ...updates }, { db }) => db.knex
      .transaction(async trx => {
        await trx('userActions')
          .where('id', id)
          .update(updates);

        return trx('userActions')
          .where('id', id)
          .first();
      })),

    async repealUserAction(
      _: unknown,
      { id, repealedBy }: {
        id: string;
        repealedBy: string;
      },
      { db }: Context,
    ) {
      const isRepealed = await db.knex('userActions')
        .where('id', id)
        .whereNotNull('repealedBy')
        .first()
        .then(Boolean);
      if (isRepealed) throw new Error('User action is already repealed');

      return db.knex.transaction(async trx => {
        await trx('userActions')
          .where('id', id)
          .update({
            repealedBy,
            repealedAt: db.knex.fn.now(),
          });

        return trx('userActions')
          .where('id', id)
          .first();
      });
    },

    async deleteUserAction(_: unknown, { id }: { id: string }, { db }: Context) {
      await db.knex('userActions')
        .where('id', id)
        .del();
    },
  },

  UserAction: {
    async banEvasionRelatedUser(action: UserActionRecord, _: unknown, { db }: Context) {
      return action.banEvasionRelatedUser && db.user.getById(action.banEvasionRelatedUser);
    },

    async repealedBy(action: UserActionRecord, _: unknown, { db }: Context) {
      return action.repealedBy && db.user.getById(action.repealedBy);
    },

    async createdBy(action: UserActionRecord, _: unknown, { db }: Context) {
      return db.user.getById(action.createdBy);
    },
  },
};
