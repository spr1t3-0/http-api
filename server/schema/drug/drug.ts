import { gql } from 'graphql-tag';
import type { Context } from '../../context';
import type { DrugNameRecord } from './name';
import type { DrugArticleRecord } from './article';
import type { DrugVariantRecord } from './variant';
import type { UserRecord } from '../user/user';

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
    articles: [DrugArticle!]!
    variants: [DrugVariant!]!
    summary: String
    psychonautWikiUrl: String
    errowidExperiencesUrl: String
    lastUpdatedBy: User! @auth(appIds: [TRIPBOT])
    updatedAt: DateTime!
    createdAt: DateTime!
  }
`;

export interface DrugRecord {
  id: string;
  summary?: string;
  psychonautWikiUrl?: string;
  errowidExperiencesUrl?: string;
  lastUpdatedBy: string;
  updatedAt: Date;
  createdAt: Date;
}

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
      { knex }: Context,
    ) {
      const sql = knex<DrugRecord>('drugs');

      if (params?.limit && params?.offset) sql.limit(params.limit).offset(params.offset);
      if (params?.id) sql.where('id', params.id);
      if (params?.name) {
        sql.innerJoin('drugNames', 'drugNames.drugId', 'drugs.id')
          .select('drugs.*')
          .whereRaw('LOWER(drug_names.name) LIKE ?', [`%${params.name}%`]);
      }

      return sql;
    },
  },

  Drug: {
    async name(drug: DrugRecord, _: unknown, { knex }: Context) {
      return knex('drugNames')
        .where('drugId', drug.id)
        .where('isDefault', true)
        .select('name')
        .first()
        .then(({ name }) => name);
    },

    async aliases(drug: DrugRecord, _: unknown, { knex }: Context) {
      return knex<DrugNameRecord>('drugNames')
        .where('drugId', drug.id)
        .where('isDefault', false);
    },

    async articles(drug: DrugRecord, _: unknown, { knex }: Context) {
      return knex<DrugArticleRecord>('drugArticles').where('drugId', drug.id);
    },

    async variants(drug: DrugRecord, _: unknown, { knex }: Context) {
      return knex<DrugVariantRecord>('drugVariants').where('drugId', drug.id);
    },

    async lastUpdatedBy(drug: DrugRecord, _: unknown, { knex }: Context) {
      return knex<UserRecord>('users')
        .where('id', drug.lastUpdatedBy)
        .first();
    },
  },
};
