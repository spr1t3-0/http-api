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

  type DrugArticle {
    id: ID!
    type: DrugArticleType!
    url: URL!
    title: String!
    description: String
    publishedAt: DateTime
    lastModifiedBy: User!
    lastModifiedAt: DateTime!
    postedBy: User!
    createdAt: DateTime!
  }

  enum DrugArticleType {
    URL
    MARKDOWN
    HTML
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

  DrugArticle: {
    async postedBy(drugArticle, _, { dataSources }) {
      return dataSources.psql.userRelation(drugArticle.postedBy, 'drugArticles', 'postedBy');
    },
  },

  DrugVariant: {
    async roas(drugVariant, _, { dataSources }) {
      return dataSources.psql.knex('drugVariantRoas')
        .where('drugVariantId', drugVariant.id);
    },

    async lastUpdatedBy(drugVariant, _, { dataSources }) {
      return dataSources.psql
        .userRelation(drugVariant.lastUpdatedBy, 'drugVariants', 'lastUpdatedBy');
    },
  },
};
