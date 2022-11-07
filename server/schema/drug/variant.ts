import { gql } from 'graphql-tag';
import type { Context } from '../../context';
import type { DrugVariantRecord } from '../../../db/drug';

export const typeDefs = gql`
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

export const resolvers = {
  DrugVariant: {
    async roas(drugVariant: DrugVariantRecord, _: unknown, { db }: Context) {
      return db.knex('drugVariantRoas').where('drugVariantId', drugVariant.id);
    },

    async lastUpdatedBy(drugVariant: DrugVariantRecord, _: unknown, { db }: Context) {
      return db.user.getById(drugVariant.lastUpdatedBy);
    },
  },
};
