import gql from 'graphql-tag';
import type { Context } from '../../context';

export const typeDefs = gql`
  extend type Mutation {
    createUserAction(
      userId: UUID!,
      type: UserActionType!,
      banEvasionRelatedUser: UUID!
      description: String!,
      internalNote: String,
      createdBy: UUID!
    ): UserAction!

    updateUserAction(
      id: UUID!,
      banEvasionRelatedUser: UUID
      description: String,
      internalNote: String,
      expiresAt: DateTime,
    ): UserAction!

    repealUserAction(id: UUID!, repealedBy: UUID!): UserAction!
    deleteUserAction(id: UUID!): Void
  }

  type UserAction {
    id: ID!
    user: User!
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

export type UserActionType = 'NOTE'
| 'WARNING'
| 'FULL_BAN'
| 'TICKET_BAN'
| 'DISCORD_BOT_BAN'
| 'BAN_EVASION'
| 'UNDERBAN'
| 'TIMEOUT'
| 'REPORT'
| 'KICK';

export interface UserActionRecord {
  id: string;
  userId: string;
  type: UserActionType;
  banEvasionRelatedUser: string | null;
  description: string;
  internalNote: string | null;
  expiresAt: Date | null;
  repealedBy: string | null;
  repealedAt: Date | null;
  createdBy: string;
  createdAt: Date;
}

interface BanEvasionCheckBaseParams {
  id?: string;
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
    const type = !params?.id ? null : await ctx.knex<UserActionRecord>('userActions')
      .select('type')
      .where('id', params?.id)
      .first()
      .then((action) => action?.type);

    if (type !== 'BAN_EVASION' && params?.banEvasionRelatedUser) {
      throw new Error('Cannot set related ban evasion user if type is not BAN_EVASION');
    }

    return fn(root, params, ctx);
  };
}

export const resolvers = {
  Mutation: {
    createUserAction: withBanEvasionCheck<{
      userId: string;
      type: UserActionType;
      description: string;
      banEvasionRelatedUser?: string;
      internalNote?: string;
      createdBy: string;
    }>(async (_, newUserAction, { knex }) => knex<UserActionRecord>('userActions')
      .insert(newUserAction)
      .returning('*')
      .then(([a]) => a)),

    updateUserAction: withBanEvasionCheck(async (_, { id, ...updates }, { knex }) => knex
      .transaction(async (trx) => {
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
      { knex }: Context,
    ) {
      const isRepealed = await knex('userActions')
        .where('id', id)
        .whereNotNull('repealedBy')
        .first()
        .then(Boolean);

      if (isRepealed) throw new Error('User action is already repealed');

      return knex.transaction(async (trx) => {
        await trx('userActions')
          .where('id', id)
          .update({
            repealedBy,
            repealedAt: knex.fn.now(),
          });

        return trx('userActions')
          .where('id', id)
          .first();
      });
    },

    async deleteUserAction(_: unknown, { id }: { id: string }, { knex }: Context) {
      await knex('userActions')
        .where('id', id)
        .del();
    },
  },

  UserAction: {
    async user(action: UserActionRecord, _: unknown, { db }: Context) {
      return db.getUserById(action.userId);
    },

    async banEvasionRelatedUser(action: UserActionRecord, _: unknown, { db }: Context) {
      return action.banEvasionRelatedUser && db.getUserById(action.banEvasionRelatedUser);
    },

    async repealedBy(action: UserActionRecord, _: unknown, { db }: Context) {
      return action.repealedBy && db.getUserById(action.repealedBy);
    },
  },
};
