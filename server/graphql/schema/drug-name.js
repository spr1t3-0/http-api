'use strict';

const { gql } = require('apollo-server-core');

exports.typeDefs = gql`
  extend type Mutation {
    createDrugName(drugId: UUID!, name: String!, type: DrugNameType!): DrugName!
    deleteDrugName(drugNameId: UUID!): Void
    setDefaultDrugName(drugNameId: UUID!): [DrugName!]!
  }

  type DrugName {
    id: ID!
    name: String!
    type: DrugNameType!
    isDefault: Boolean!
  }

  enum DrugNameType {
    COMMON
    SUBSTITUTIVE
    SYSTEMATIC
  }
`;

exports.resolvers = {
  Mutation: {
    async createDrugName(_, newDrugName, { dataSources }) {
      return dataSources.psql.knex('drugNames')
        .insert(newDrugName)
        .returning('*')
        .then(([a]) => a);
    },

    async deleteDrugName(_, { drugNameId }, { dataSources }) {
      await dataSources.psql.knex('drugNames')
        .where('id', drugNameId)
        .del();
    },

    async setDefaultDrugName(_, { drugNameId }, { dataSources }) {
      const drugId = await dataSources.psql.knex('drugNames')
        .where('id', drugNameId)
        .select('drugId')
        .first()
        .then(({ id }) => id);

      return dataSources.psql.knex.transacting(async trx => {
        await trx('drugNames')
          .where('drugId', drugId)
          .where('isDefault', true)
          .update('isDefault', false);

        await trx('drugNames')
          .where('id', drugNameId)
          .update('isDefault', true);

        return trx('drugNames').where('drugId', drugId);
      });
    },
  },
};
