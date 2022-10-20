'use strict';

const { gql } = require('apollo-server-core');

exports.typeDefs = gql`
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
