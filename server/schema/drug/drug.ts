import { gql } from 'graphql-tag';
import type { Context } from '../../context';
import type { DrugRecord, DrugArticleRecord, DrugVariantRecord } from '../../../db/drug';

export const typeDefs = gql`
  extend type Query {
    drugs(
      id: UUID,
      name: String,
      limit: UnsignedInt,
      offset: UnsignedInt
    ): [Drug!]!
  }

  input DrugsQuery {
    id: UUID
    name: String
    limit: UnsignedInt
    offset: UnsignedInt
  }

  type Drug {
    id: ID!
    name: String!
    aliases: [DrugName!]!
    categories: [DrugCategory!]!
    articles: [DrugArticle!]!
    variants: [DrugVariant!]!
    summary: String
    psychonautWikiUrl: String
    errowidExperiencesUrl: String
    lastUpdatedBy: User!
    updatedAt: DateTime!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  Query: {
    async drugs(
      _: unknown,
      params: {
        id?: string;
        name?: string;
        limit?: number;
        offset?: number;
      },
      { db }: Context,
    ) {
      const sql = db.knex<DrugRecord>('drugs');

      if (params?.limit) sql.limit(params.limit);
      if (params?.offset) sql.offset(params.offset);
      if (params?.id) sql.where('drugs.id', params.id);
      if (params?.name) {
        sql.innerJoin('drugNames', 'drugNames.drugId', 'drugs.id')
          .select('drugs.*')
          .whereRaw('LOWER(drug_names.name) LIKE ?', [`%${params.name.toLowerCase()}%`]);
      }

      return sql;
    },
  },

  Drug: {
    async name(drug: DrugRecord, _: unknown, { db }: Context) {
      return db.drug.getNames(drug.id)
        .where('isDefault', true)
        .select('name')
        .first()
        .then((drugName) => drugName?.name);
    },

    async aliases(drug: DrugRecord, _: unknown, { db }: Context) {
      return db.drug.getNames(drug.id).where('isDefault', false);
    },

    async categories(drug: DrugRecord, _: unknown, { db }: Context) {
      return db.knex('drugCategoryDrugs')
        .innerJoin('drugCategories', 'drugCategories.id', 'drugCategoryDrugs.drugCategoryId')
        .where('drugCategoryDrugs.drugId', drug.id)
        .select('drugCategories.*')
        .orderBy('drugCategories.name');
    },

    async articles(drug: DrugRecord, _: unknown, { db }: Context) {
      return db.knex<DrugArticleRecord>('drugArticles').where('drugId', drug.id);
    },

    async variants(drug: DrugRecord, _: unknown, { db }: Context) {
      return db.knex<DrugVariantRecord>('drugVariants').where('drugId', drug.id);
    },

    async lastUpdatedBy(drug: DrugRecord, _: unknown, { db }: Context) {
      return db.user.getById(drug.lastUpdatedBy);
    },
  },
};
