import type { Knex } from 'knex';

export default function createMockDb(knex: Knex) {
  return {
    knex,
    user: {
      getById: jest.fn(),
    },
    drug: {
      getNames: jest.fn(),
    },
  };
}
