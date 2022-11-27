import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../../tests/test-server';
import createDiscordApi, { DiscordApi } from '../../../../../discord-api';
import { uuidPattern } from '../../../../../tests/patterns';
import type { DrugCategoryRecord, DrugNameRecord } from '../../../../../db/drug';

let server: ApolloServer;
let knex: Knex;
let discordApi: DiscordApi;
let lsdId: string;
beforeAll(async () => {
  knex = createTestKnex();
  server = createTestServer();
  discordApi = createDiscordApi();
  lsdId = await knex<DrugNameRecord>('drugNames')
    .where('name', 'LSD')
    .select('drugId')
    .first()
    .then(record => record!.drugId);
});

afterAll(async () => knex.destroy());

describe('Query', () => {
  let testDrugCategories: {
    stimulant: DrugCategoryRecord;
    arylcyclohexylamine: DrugCategoryRecord;
    psychedelic: DrugCategoryRecord;
  };
  beforeAll(async () => {
    await knex('drugCategories').del();
    testDrugCategories = await knex('drugCategories')
      .insert([
        {
          name: 'Stimulant',
          type: 'PSYCHOACTIVE',
        },
        {
          name: 'Arylcyclohexylamine',
          type: 'CHEMICAL',
        },
        {
          name: 'Psychedelic',
          type: 'PSYCHOACTIVE',
        },
      ])
      .returning('*')
      .then(([stimulant, arylcyclohexylamine, psychedelic]) => ({
        stimulant,
        arylcyclohexylamine,
        psychedelic,
      }));
  });

  afterAll(async () => knex('drugCategories').del());

  describe('drugCategories', () => {
    test('With no parameters returns all drug categories', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query AllDrugCategories {
            drugCategories {
              id
              name
              type
              createdAt
            }
          }
        `,
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugCategories: [
          testDrugCategories.arylcyclohexylamine,
          testDrugCategories.psychedelic,
          testDrugCategories.stimulant,
        ],
      });
    });

    test('Can get drug category by ID', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugCategoryById($id: UUID!) {
            drugCategories(id: $id) {
              id
              name
              type
              createdAt
            }
          }
        `,
        variables: {
          id: testDrugCategories.arylcyclohexylamine.id,
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugCategories: [testDrugCategories.arylcyclohexylamine],
      });
    });

    test('Can get drug category by name', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugCategoryByName($name: String!) {
            drugCategories(name: $name) {
              id
              name
              type
              createdAt
            }
          }
        `,
        variables: {
          name: 'ULanT',
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugCategories: [testDrugCategories.stimulant],
      });
    });

    test('Can get drug category by type', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugCategoryByType($type: DrugCategoryType!) {
            drugCategories(type: $type) {
              id
              name
              type
              createdAt
            }
          }
        `,
        variables: {
          type: 'PSYCHOACTIVE',
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugCategories: [
          testDrugCategories.psychedelic,
          testDrugCategories.stimulant,
        ],
      });
    });
  });
});

describe('Mutation', () => {
  let newDrugCategoryId: string;

  test('createDrugCategory', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation CreateDrugCategory($name: String!, $type: DrugCategoryType!) {
          createDrugCategory(name: $name, type: $type) {
            id
            name
            type
            createdAt
          }
        }
      `,
      variables: {
        name: 'Benzodiazapine',
        type: 'CHEMICAL',
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      createDrugCategory: {
        id: expect.stringMatching(uuidPattern),
        name: 'Benzodiazapine',
        type: 'CHEMICAL',
        createdAt: expect.any(Date),
      },
    });

    newDrugCategoryId = (body.singleResult.data!.createDrugCategory as { id: string }).id;
  });

  test('associateDrugWithCategory', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation AssociateDrugWithCategory($drugId: UUID!, $drugCategoryId: UUID!) {
          associateDrugWithCategory(drugId: $drugId, drugCategoryId: $drugCategoryId) {
            id
            name
            categories {
              id
              name
              type
              createdAt
            }
          }
        }
      `,
      variables: {
        drugId: lsdId,
        drugCategoryId: newDrugCategoryId,
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      associateDrugWithCategory: {
        id: lsdId,
        name: 'LSD',
        categories: [{
          id: newDrugCategoryId,
          name: 'Benzodiazapine',
          type: 'CHEMICAL',
          createdAt: expect.any(Date),
        }],
      },
    });
  });

  test('disassociateDrugFromCategory', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation disassociateDrugFromCategory($drugId: UUID!, $drugCategoryId: UUID!) {
          disassociateDrugFromCategory(drugId: $drugId, drugCategoryId: $drugCategoryId) {
            id
            name
            categories {
              id
              name
              type
              createdAt
            }
          }
        }
      `,
      variables: {
        drugId: lsdId,
        drugCategoryId: newDrugCategoryId,
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      disassociateDrugFromCategory: {
        id: lsdId,
        name: 'LSD',
        categories: [],
      },
    });
  });

  test('deleteDrugCategory', async () => {
    await expect(knex('drugCategories')
      .where('id', newDrugCategoryId)
      .first()
      .then(Boolean))
      .resolves.toBe(true);

    const { body } = await server.executeOperation({
      query: gql`
        mutation DeleteDrugCategory($id: UUID!) {
          deleteDrugCategory(id: $id)
        }
      `,
      variables: {
        id: newDrugCategoryId,
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      deleteDrugCategory: null,
    });

    await expect(knex('drugCategories')
      .where('id', newDrugCategoryId)
      .first()
      .then(Boolean))
      .resolves.toBe(false);
  });
});

describe('DrugCategory', () => {
  let categoryId: string;
  beforeAll(async () => {
    categoryId = await server.executeOperation({
      query: gql`
        mutation CreateDrugCategory($name: String!, $type: DrugCategoryType!) {
          createDrugCategory(name: $name, type: $type) {
            id
            name
            type
            createdAt
          }
        }
      `,
      variables: {
        name: 'Benzodiazapine',
        type: 'CHEMICAL',
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    })
      .then(({ body }) => {
        if (body.kind !== 'single') throw new Error('Invalid response for creating category');
        return (body.singleResult.data!.createDrugCategory as { id: string }).id;
      });

    await server.executeOperation({
      query: gql`
        mutation associateDrugWithCategory($drugId: UUID!, $drugCategoryId: UUID!) {
          associateDrugWithCategory(drugId: $drugId, drugCategoryId: $drugCategoryId) {
            id
          }
        }
      `,
      variables: {
        drugId: lsdId,
        drugCategoryId: categoryId,
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });
  });

  test('drugs', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        query CategoryDrugs($id: UUID!) {
          drugCategories(id: $id) {
            drugs {
              id
              name
            }
          }
        }
      `,
      variables: {
        id: categoryId,
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      drugCategories: [{
        drugs: [{
          id: lsdId,
          name: 'LSD',
        }],
      }],
    });
  });
});
