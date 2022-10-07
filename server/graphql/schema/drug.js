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
    variants: [DrugVariant!]!
    summary: String
    psychonautWikiUrl: String
    errowidExperiencesUrl: String
    lastUpdatedBy: User!
    updatedAt: DateTime!
    createdAt: DateTime!
  }

  type DrugName {
    id: ID!
    name: String!
    type: DrugNameType!
  }

  enum DrugNameType {
    COMMON
    SUBSTITUTIVE
    SYSTEMATIC
  }

  type DrugVariant {
    id: ID!
    name: String
    description: String
    roas: [DrugVariantRoa!]!
    default: Boolean!
    lastUpdatedBy: User!
    updatedAt: DateTime!
    createdAt: DateTime!
  }

  type DrugVariantRoa {
    id: ID!
    route: RouteOfAdministration!

    doseThreshold: UnsignedFloat
    doseLight: UnsignedFloat
    doseCommon: UnsignedFloat
    doseStrong: UnsignedFloat
    doseHeavy: UnsignedFloat
    doseWarning: UnsignedFloat

    durationTotalMin: UnsignedFloat
    durationTotalMax: UnsignedFloat
    durationOnsetMin: UnsignedFloat
    durationOnsetMax: UnsignedFloat
    durationComeupMin: UnsignedFloat
    durationComeupMax: UnsignedFloat
    durationPeakMin: UnsignedFloat
    durationPeakMax: UnsignedFloat
    durationOffsetMin: UnsignedFloat
    durationOffsetMax: UnsignedFloat
    durationAfterEffectsMin: UnsignedFloat
    durationAfterEffectsMax: UnsignedFloat
  }

  enum RouteOfAdministration {
    ORAL
    INSUFFLATED
    INHALED
    TOPICAL
    SUBLINGUAL
    BUCCAL
    RECTAL
    INTRAMUSCULAR
    INTRAVENOUS
    SUBCUTANIOUS
    TRANSDERMAL
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
        .where('default', true)
        .select('name')
        .first()
        .then(({ name }) => name);
    },

    async aliases(drug, _, { dataSources }) {
      return dataSources.psql.knex('drugNames')
        .where('drugId', drug.id)
        .where('default', false);
    },

    async variants(drug, _, { dataSources }) {
      return dataSources.psql.knex('drugVariants')
        .where('drugId', drug.id);
    },

    async lastUpdatedBy(drug, _, { dataSources }) {
      return dataSources.psql.knex('drugs')
        .innerJoin('users', 'users.id', 'drugs.lastUpdatedBy')
        .where('drugs.id', drug.id)
        .select('users.*')
        .first();
    },
  },

  DrugVariant: {
    async roas(drugVariant, _, { dataSources }) {
      return dataSources.psql.knex('drugVariantRoas')
        .where('drugVariantId', drugVariant.id);
    },

    async lastUpdatedBy(drugVariant, _, { dataSources }) {
      return dataSources.psql.knex('drugVariants')
        .innerJoin('users', 'users.id', 'drugVariants.lastUpdatedBy')
        .where('drugVariants.id', drugVariant.id)
        .select('users.*')
        .first();
    },
  },
};
