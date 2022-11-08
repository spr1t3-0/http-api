import { gql } from 'graphql-tag';
import type { Context } from '../../context';
import type { DrugArticleRecord } from '../../../db/drug';

export const typeDefs = gql`
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
`;

export const resolvers = {
  DrugArticle: {
    lastModifiedBy(drugArticle: DrugArticleRecord, _: {}, { db }: Context) {
      return db.user.getById(drugArticle.lastModifiedBy);
    },

    postedBy(drugArticle: DrugArticleRecord, _: {}, { db }: Context) {
      return db.user.getById(drugArticle.postedBy);
    },
  },
};
