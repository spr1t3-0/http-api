'use strict';

const { gql } = require('apollo-server-core');

exports.typeDefs = gql`
  extend type Query {
    drugs(query: DrugsQuery): [Drug!]!
  }

  extend type Mutation {
    createDrug(
      name: String,
      summary: String,
      psychonautWikiUrl: String,
      errowidExperiencesUrl: String
    ): Drug!
    updateDrug(drugId: UUID!, updatingDrug: UpdateDrugInput!): Drug!
    removeDrug(drugId: UUID!): Void
  }

  input DrugsQuery {
    name: String
    limit: UnsignedInt
    offset: UnsignedInt
  }

  input CreateDrugInput {
    name: String!
    summary: String
    psychonautWikiUrl: String
    errowidExperiencesUrl: String
  }

  input UpdateDrugInput {
    summary: String!
    psychonautWikiUrl: String!
    errowidExperiencesUrl: String!
  }

  type Drug {
    id: ID!
    name: String!
    aliases: [DrugName!]!
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
      const sql = dataSources.psql.knex('drugs')
        .limit(query.limit || 50)
        .offset(query.offset || 0);
      if (query.name) {
        sql.innerJoin('drugNames', 'drugNames.drugId', 'drugs.id')
          .select('drugs.*')
          .where('LOWER(name)', 'LIKE', `%${query.name.toLowerCase()}%`);
      }
      return sql;
    },
  },

  Drug: {
    async name(drug, _, { dataSources }) {
      return dataSources.psql.knex('drugNames')
        .where('drugId', drug.id)
        .where('default', true)
        .select('name')
        .first()
        .then(({ name }) => name);
    },

    async aliases(drug, __, { dataSources }) {
      return dataSources.psql.knex('drugNames')
        .where('drugId', drug.id)
        .where('default', false);
    },

    async lastUpdatedBy(drug, __, { dataSources }) {
      return dataSources.psql.knex('users')
        .where('id', drug.userId)
        .first();
    },
  },
};
