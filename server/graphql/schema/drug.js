'use strict';

const { gql } = require('apollo-server-core');

exports.typeDefs = gql`
  extend type Query {
    drugs(query: DrugsQuery): [Drug!]!
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
    lastUpdatedBy: User!
    updatedAt: DateTime!
    createdAt: DateTime!
  }
`;

exports.resolvers = {
  Query: {
    async drugs(_, { query }, { dataSources }) {
      const sql = dataSources.psql.knex('drugs');
      if (query?.limit || query?.offset) sql.limit(query.limit).offset(query.offset);

      if (query?.id) sql.where('id', query.id);
      if (query?.name) {
        sql.innerJoin('drugNames', 'drugNames.drugId', 'drugs.id')
          .select('drugs.*')
          .whereRaw('LOWER(drug_names.name) LIKE ?', [`%${query.name}%`]);
      }

      return sql;
    },
  },

  Drug: {
    async name(drug, _, { dataSources }) {
      return dataSources.psql.knex('drugNames')
        .where('drugId', drug.id)
        .where('isDefault', true)
        .select('name')
        .first()
        .then(({ name }) => name);
    },

    async aliases(drug, _, { dataSources }) {
      return dataSources.psql.knex('drugNames')
        .where('drugId', drug.id)
        .where('isDefault', false);
    },

    async articles(drug, _, { dataSources }) {
      return dataSources.psql.knex('drugArticles')
        .where('drugId', drug.id)
        .where('deleted', false);
    },

    async variants(drug, _, { dataSources }) {
      return dataSources.psql.knex('drugVariants')
        .where('drugId', drug.id);
    },

    async lastUpdatedBy(drug, _, { dataSources }) {
      return dataSources.psql.userRelation(drug.lastUpdatedBy, 'drugs', 'lastUpdatedBy');
    },
  },
};
