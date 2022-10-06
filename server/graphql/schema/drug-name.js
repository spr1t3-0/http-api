'use strict';

const { gql, ValidationError } = require('apollo-server-core');

exports.typeDefs = gql`
  extend type Mutation {
    createDrugName(newDrug: CreateDrugNameInput!): DrugName!
    removeDrugName(drugNameId: UUID!): Void
  }

  input CreateDrugNameInput {
    name: String!
    drugId: UUID!
    type: DrugNameType
    default: Boolean
  }

  type DrugName {
    id: ID!
    name: String!
    type: DrugNameType!
    drug: Drug!
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
      const exists = await dataSources.psql.knex('drugNames')
        .where('drugId', newDrugName.drugId)
        .where('name', newDrugName.name)
        .first()
        .then(Boolean);

      if (exists) throw new ValidationError('Cannot have duplicate names for the same drug');

      return dataSources.psql.knex('drugNames')
        .insert(newDrugName)
        .returning('*')
        .then(([a]) => a);
    },

    async removeDrugName(_, { drugNameId }, { dataSources }) {
      await dataSources.psql.knex('drugNames').where('id', drugNameId);
    },
  },

  DrugName: {
    async drug(drugName, _, { dataSources }) {
      return dataSources.psql.knex('drugs')
        .where('id', drugName.drugId)
        .first();
    },
  },
};
