import gql from 'graphql-tag';
import type { Context } from '../../context';
import type { DrugCategoryRecord, DrugCategoryType } from '../../../db/drug';

export const typeDefs = gql`
  extend type Query {
    drugCategories(id: UUID, name: String, type: DrugCategoryType): [DrugCategory!]!
  }

  extend type Mutation {
    createDrugCategory(name: String!, type: DrugCategoryType!): DrugCategory!
    deleteDrugCategory(id: UUID!): Void
    associateDrugWithCategory(drugId: UUID!, drugCategoryId: UUID!): Drug!
    disassociateDrugFromCategory(drugId: UUID!, drugCategoryId: UUID!): Drug!
  }

  type DrugCategory {
    id: ID!
    name: String!
    type: DrugCategoryType!
    drugs: [Drug!]!
    createdAt: DateTime!
  }

  enum DrugCategoryType {
    COMMON
    PSYCHOACTIVE
    CHEMICAL
  }
`;

interface AssociateParams {
  drugId: string;
  categoryId: string;
}

export const resolvers = {
  Query: {
    async drugCategories(
      _: unknown,
      params: {
        id?: string;
        name?: string;
        type?: DrugCategoryType;
      },
      { db }: Context,
    ) {
      const sql = db.knex<DrugCategoryRecord>('drugCategories').orderBy('name');
      if (params.id) sql.where('id', params.id);
      if (params.name) sql.whereRaw('LOWER(name) LIKE ?', [`%${params.name.toLowerCase()}%`]);
      if (params.type) sql.where('type', params.type);
      return sql;
    },
  },

  Mutation: {
    async createDrugCategory(
      _: unknown,
      params: {
        name: string;
        type: DrugCategoryType;
      },
      { db }: Context,
    ) {
      return db.knex<DrugCategoryRecord>('drugCategories')
        .insert(params)
        .returning('*')
        .then(([record]) => record);
    },

    async deleteDrugCategory(_: unknown, { id }: { id: string; }, { db }: Context) {
      await db.knex('drugCategories')
        .where('id', id)
        .del();
      return null;
    },

    async associateDrugWithCategory(_: unknown, params: AssociateParams, { db }: Context) {
      return db.knex.transaction(async (trx) => {
        await trx('drugCategoryDrugs').insert(params);
        return trx<DrugCategoryRecord>('drugs')
          .where('id', params.drugId)
          .first();
      });
    },

    async disassociateDrugFromCategory(_: unknown, params: AssociateParams, { db }: Context) {
      return db.knex.transaction(async (trx) => {
        await trx('drugCategoryDrugs')
          .where(params)
          .del();

        return trx<DrugCategoryRecord>('drugs')
          .where('id', params.drugId)
          .first();
      });
    },
  },

  DrugCategory: {
    async drugs(category: DrugCategoryRecord, _: unknown, { db }: Context) {
      return db.knex('drugCategoryDrugs')
        .innerJoin('drugs', 'drugs.id', 'drugCategoryDrugs.drugId')
        .where('drugCategoryDrugs.drugCategoryId', category.id)
        .select('drugs.*');
    },
  },
};
