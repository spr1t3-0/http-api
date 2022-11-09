import gql from 'graphql-tag';
import type { Context } from '../../context';
import type { UserDrugDoseRecord } from '../../../db/user';

export const typeDefs = gql`
  extend type Mutation {
    createUserDrugDose(
      userId: UUID!,
      drugId: UUID!,
      route: RouteOfAdministration,
      dose: UnsignedFloat!,
      units: Units!,
    ): UserDrugDose!
  }

  type UserDrugDose {
    id: ID!
    user: User!
    drug: Drug!
    route: RouteOfAdministration
    dose: UnsignedFloat!
    units: Units!
    createdAt: DateTime!
  }

  enum Units {
    MG
    ML
    UG
    G
    OZ
    FLOZ
  }
`;

export const resolvers = {
  Mutation: {
    async createUserDrugDose(
      dose: UserDrugDoseRecord,
      newDose: Omit<UserDrugDoseRecord, 'id' | 'createdAt'>,
      { db }: Context,
    ) {
      return db.knex<UserDrugDoseRecord>('userDrugDoses')
        .insert(newDose)
        .returning('*')
        .then(([record]) => record);
    },
  },

  UserDrugDose: {
    async user(dose: UserDrugDoseRecord, _: unknown, { db }: Context) {
      return db.user.getById(dose.userId);
    },

    async drug(dose: UserDrugDoseRecord, _: unknown, { db }: Context) {
      return db.drug.getById(dose.drugId);
    },
  },
};
