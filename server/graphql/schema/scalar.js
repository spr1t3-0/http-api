'use strict';

const { gql } = require('apollo-server-core');
const {
  VoidResolver,
  UUIDResolver,
  UnsignedIntResolver,
  UnsignedFloatResolver,
  DateTimeResolver,
  DurationResolver,
  EmailAddressResolver,
  URLResolver,
} = require('graphql-scalars');

exports.typeDefs = gql`
  scalar Void
  scalar UUID
  scalar UnsignedInt
  scalar UnsignedFloat
  scalar DateTime
  scalar Duration
  scalar EmailAddress
  scalar URL
`;

exports.resolvers = {
  Void: VoidResolver,
  UUID: UUIDResolver,
  UnsignedInt: UnsignedIntResolver,
  UnsignedFloat: UnsignedFloatResolver,
  DateTime: DateTimeResolver,
  Duration: DurationResolver,
  EmailAddress: EmailAddressResolver,
  URL: URLResolver,
};
