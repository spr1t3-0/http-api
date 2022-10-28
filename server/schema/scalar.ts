import { gql } from 'graphql-tag';
import {
  VoidResolver,
  UUIDResolver,
  UnsignedIntResolver,
  UnsignedFloatResolver,
  DateTimeResolver,
  DurationResolver,
  EmailAddressResolver,
  URLResolver,
} from 'graphql-scalars';

export const typeDefs = gql`
  scalar Void
  scalar UUID
  scalar UnsignedInt
  scalar UnsignedFloat
  scalar DateTime
  scalar Duration
  scalar EmailAddress
  scalar URL
`;

export const resolvers = {
  Query: {},
  Mutation: {},
  Void: VoidResolver,
  UUID: UUIDResolver,
  UnsignedInt: UnsignedIntResolver,
  UnsignedFloat: UnsignedFloatResolver,
  DateTime: DateTimeResolver,
  Duration: DurationResolver,
  EmailAddress: EmailAddressResolver,
  URL: URLResolver,
};
