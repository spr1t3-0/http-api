import { gql } from 'graphql-tag';
import type { Context } from '../../context';

export const typeDefs = gql`
  extend type Mutation {
    createDrugName(drugId: UUID!, name: String!, type: DrugNameType!): DrugName!
    deleteDrugName(drugNameId: UUID!): Void
    setDefaultDrugName(drugNameId: UUID!): [DrugName!]!
  }

  type DrugName {
    id: ID!
    name: String!
    type: DrugNameType!
    isDefault: Boolean!
  }

  enum DrugNameType {
    BRAND
    COMMON
    SUBSTITUTIVE
    SYSTEMATIC
  }
`;

type DrugNameType = 'BRAND' | 'COMMON' | 'SUBSTITUTIVE' | 'SYSTEMATIC';

export interface DrugNameRecord {
  id: string;
  drugId: string;
  name: string;
  isDefault: boolean;
  type: DrugNameType;
}

export const resolvers = {
  Query: {},

  Mutation: {
    async createDrugName(
      _: unknown,
      newDrugName: {
        drugId: string;
        name: string;
        type: DrugNameType;
      },
      { knex }: Context,
    ) {
      return knex<DrugNameRecord>('drugNames')
        .insert(newDrugName)
        .returning('*')
        .then(([a]) => a);
    },

    async deleteDrugName(_: unknown, { drugNameId }: { drugNameId: string }, { knex }: Context) {
      await knex('drugNames')
        .where('id', drugNameId)
        .del();
    },

    async setDefaultDrugName(
      _: unknown,
      { drugNameId }: { drugNameId: string },
      { knex }: Context,
    ) {
      const drugId: string = await knex<{ id: string }>('drugNames')
        .where('id', drugNameId)
        .select('drugId')
        .first()
        .then(({ id }) => id);

      return knex.transaction(async (trx) => {
        await trx('drugNames')
          .where('drugId', drugId)
          .where('isDefault', true)
          .update('isDefault', false);

        await trx('drugNames')
          .where('id', drugNameId)
          .update('isDefault', true);

        return trx<DrugNameRecord>('drugNames').where('drugId', drugId);
      });
    },
  },
};
