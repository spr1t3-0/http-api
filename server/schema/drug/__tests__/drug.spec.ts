import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../tests/test-knex';
import type { DrugCategoryRecord, DrugNameRecord } from '../../../../db/drug';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
import createDiscordApi, { DiscordApi } from '../../../../discord-api';
import { uuidPattern } from '../../../../tests/patterns';

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
  describe('drugs', () => {
    test('Can get a drug by ID', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugById($id: UUID!) {
            drugs(id: $id) {
              id
              name
            }
          }
        `,
        variables: { id: lsdId },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugs: [{
          id: lsdId,
          name: 'LSD',
        }],
      });
    });

    test('Can get a drug by name case insensitivly', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugsByName($name: String!) {
            drugs(name: $name) {
              name
            }
          }
        `,
        variables: { name: 'fLuoRoKETaMine' },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugs: [
          { name: '2-FDCK' },
          { name: '2-FDCK' },
        ],
      });
    });

    test('Limit and offset', async () => {
      interface DrugData {
        id: string;
        name: string;
      }

      const contextValue = await createTestContext(knex, discordApi);
      const query = gql`
        query DrugOffsetLimit($offset: UnsignedInt, $limit: UnsignedInt!) {
          drugs(offset: $offset, limit: $limit) {
            id
            name
          }
        }
      `;

      const { body: pageOne } = await server.executeOperation({
        query,
        variables: { limit: 5 },
      }, { contextValue });

      assert(pageOne.kind === 'single');
      expect(pageOne.singleResult.errors).toBeUndefined();
      expect(pageOne.singleResult.data?.drugs).toHaveLength(5);
      const lastId = (pageOne.singleResult.data!.drugs as DrugData[]).at(3)!.id;

      const { body: pageTwo } = await server.executeOperation({
        query,
        variables: {
          offset: 2,
          limit: 4,
        },
      }, { contextValue });

      assert(pageTwo.kind === 'single');
      expect(pageTwo.singleResult.errors).toBeUndefined();
      expect(pageTwo.singleResult.data?.drugs).toHaveLength(4);
      expect((pageTwo.singleResult.data?.drugs as DrugData[]).at(1)?.id).toBe(lastId);
    });
  });
});

describe('Drug', () => {
  test('name', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        query DrugName($id: UUID!) {
          drugs(id: $id) {
            name
          }
        }
      `,
      variables: { id: lsdId },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      drugs: [{ name: 'LSD' }],
    });
  });

  test('aliases', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        query DrugAliases($id: UUID!) {
          drugs(id: $id) {
            aliases {
              id
              name
              type
            }
          }
        }
      `,
      variables: { id: lsdId },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      drugs: [{
        aliases: [
          {
            id: expect.stringMatching(uuidPattern),
            name: 'acid',
            type: 'COMMON',
          },
          {
            id: expect.stringMatching(uuidPattern),
            name: 'cid',
            type: 'COMMON',
          },
          {
            id: expect.stringMatching(uuidPattern),
            name: 'lsd-25',
            type: 'COMMON',
          },
          {
            id: expect.stringMatching(uuidPattern),
            name: 'lucy',
            type: 'COMMON',
          },
        ],
      }],
    });
  });

  describe('categories', () => {
    let categoryId: string;
    beforeAll(async () => {
      await knex('drugCategories').del();

      categoryId = await knex<DrugCategoryRecord>('drugCategories')
        .insert({
          name: 'Psychedelic',
          type: 'PSYCHOACTIVE',
        })
        .returning('id')
        .then(([record]) => record.id);

      await knex('drugCategoryDrugs').insert({
        drugId: lsdId,
        drugCategoryId: categoryId,
      });
    });

    test('Gets categories associated with a drug', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugCategories($id: UUID!) {
            drugs(id: $id) {
              id
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
          id: lsdId,
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugs: [{
          id: lsdId,
          categories: [{
            id: expect.stringMatching(uuidPattern),
            name: 'Psychedelic',
            type: 'PSYCHOACTIVE',
            createdAt: expect.any(Date),
          }],
        }],
      });
    });
  });

  test('lastUpdatedBy', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        query DrugLastUpdatedBy($id: UUID!) {
          drugs(id: $id) {
            lastUpdatedBy {
              username
            }
          }
        }
      `,
      variables: { id: lsdId },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      drugs: [{
        lastUpdatedBy: {
          username: 'MoonBear',
        },
      }],
    });
  });
});
