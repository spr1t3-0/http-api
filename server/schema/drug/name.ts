import { gql } from 'graphql-tag';
import type { Context } from '../../context';
import type { DrugRecord, DrugNameRecord, DrugNameType } from '../../../db/drug';

export const typeDefs = gql`
  extend type Mutation {
    createDrugName(drugId: UUID!, name: String!, type: DrugNameType!): DrugName!
    setDefaultDrugName(id: UUID!): [DrugName!]!
    deleteDrugName(id: UUID!): Void
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

export const resolvers = {
  Mutation: {
    async createDrugName(
      _: unknown,
      newDrugName: {
        drugId: string;
        name: string;
        type: DrugNameType;
      },
      { db }: Context,
    ) {
      return db.knex<DrugNameRecord>('drugNames')
        .insert(newDrugName)
        .returning('*')
        .then(([a]) => a);
    },

    async setDefaultDrugName(
      _: unknown,
      { id }: { id: string },
      { db }: Context,
    ) {
      const drugId = await db.knex<DrugRecord>('drugNames')
        .where('id', id)
        .select('drugId')
        .first()
        .then((name) => name!.drugId);

      return db.knex.transaction(async (trx) => {
        await trx('drugNames')
          .where('drugId', drugId)
          .where('isDefault', true)
          .update('isDefault', false);

        await trx('drugNames')
          .where('id', id)
          .update('isDefault', true);

        return trx<DrugNameRecord>('drugNames').where('drugId', drugId);
      });
    },

    async deleteDrugName(_: unknown, { id }: { id: string }, { db }: Context) {
      await db.knex('drugNames')
        .where('id', id)
        .del();
    },
  },
};
