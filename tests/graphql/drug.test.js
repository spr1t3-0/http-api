'use strict';

const { gql } = require('apollo-server-core');
const createTestApolloServer = require('../utils/test-apollo-server');
const createTestKnex = require('../utils/test-knex');

let knex;
beforeAll(() => {
  knex = createTestKnex();
});

afterAll(() => {
  knex.destroy();
});

describe('Query', () => {
  describe('drugs', () => {
    test('Returns all drugs', async () => {
      const { errors, data } = await createTestApolloServer().executeOperation({
        query: gql`
          query DrugsTest {
            drugs {
              id
              name
            }
          }
        `,
      });

      expect(errors).toBeUndefined();
      expect(data.drugs).toBeInstanceOf(Array);
    });
  });
});
