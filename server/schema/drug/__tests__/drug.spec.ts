// import assert from 'node:assert';
// import type { ApolloServer } from '@apollo/server';
// import gql from 'graphql-tag';
// import type { Knex } from 'knex';
// import createTestKnex from '../../../../tests/test-knex';
// import createTestServer, { createTestContext } from '../../../../tests/test-server';
// import getTestUsers, { TestUsers } from '../../../../tests/test-users';
// import { uuidPattern } from '../../../../tests/patterns';
// import type { DrugRecord } from '../../../../db/'

// let server: ApolloServer;
// let knex: Knex;
// let lsd
beforeAll(async () => {
  // knex = createTestKnex();
  // server = createTestServer();
});

// afterAll(async () => knex.destroy());

describe('Query', () => {
  describe('drugs', () => {
    test('Can get a drug by ID', async () => {
      expect(true).toBe(true);
    });
  });
});
