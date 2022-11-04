import { gql } from 'graphql-tag';
import type { Context } from '../../context';

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

type DrugArticleType = 'URL' | 'MARKDOWN' | 'HTML';

export interface DrugArticleRecord {
  id: string;
  type: DrugArticleType;
  url: string;
  title: string;
  description?: string;
  publishedAt?: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  postedBy: string;
  createdAt: Date;
}

export const resolvers = {
  Query: {},

  Mutation: {},

  DrugArticle: {
    lastModifiedBy(drugArticle: DrugArticleRecord, _: {}, { knex }: Context) {
      return knex('users')
        .where('id', drugArticle.lastModifiedBy)
        .first();
    },

    postedBy(drugArticle: DrugArticleRecord, _: {}, { knex }: Context) {
      return knex('users')
        .where('id', drugArticle.postedBy)
        .first();
    },
  },
};
