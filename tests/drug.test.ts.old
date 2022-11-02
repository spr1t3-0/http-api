import { gql } from 'graphql-tag';
import type { ApolloServer } from '@apollo/server';
import type { Knex } from 'knex';
import createTestKnex from './utils/test-knex';
import createTestApolloServer from './utils/test-apollo-server';
import { uuidPattern } from './utils/patterns';

let knex: Knex;
let apolloServer: ApolloServer;
let amphetamineId: string;
beforeAll(async () => {
  knex = createTestKnex();
  apolloServer = createTestApolloServer();
  amphetamineId = await knex('drugs')
    .where('psychonautWikiUrl', 'https://drugs.tripsit.me/amphetamine')
    .select('id')
    .first()
    .then(({ id }) => id);
});

afterAll(() => {
  knex.destroy();
});

describe.skip('Query', () => {
  describe('drugs', () => {
    test('Returns all drugs', async () => {
      interface Response {
        drugs: {
          id: string;
          name: string;
        }[];
      }

      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query AllDrugs {
            drugs {
              id
              name
            }
          }
        `,
      });

      expect(errors).toBeUndefined();
      expect(data.drugs).toBeInstanceOf(Array);
      expect(data.drugs.length).toBeGreaterThan(300);
      expect(data.drugs.at(0).id).toMatch(uuidPattern);
    });

    test('Filters by ID', async () => {
      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query DrugsById($query: DrugsQuery) {
            drugs(query: $query) {
              id
              name
            }
          }
        `,
        variables: {
          query: {
            id: amphetamineId,
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data.drugs).toHaveLength(1);
      expect(data.drugs).toEqual([{
        id: amphetamineId,
        name: 'Amphetamine',
      }]);
    });

    test('Filters by names containing string', async () => {
      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query DrugsByName($query: DrugsQuery) {
            drugs(query: $query) {
              id
              name
            }
          }
        `,
        variables: {
          query: {
            name: 'amphetamine',
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data.drugs.length).toBeLessThan(120);
      expect(data.drugs.some(drug => drug.id === amphetamineId)).toBe(true);
      expect(data.drugs.map(drug => drug.name)).toContain('4-FA');
    });

    test('Paging limit', async () => {
      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query DrugsWithLimit($query: DrugsQuery) {
            drugs(query: $query) {
              id
              name
            }
          }
        `,
        variables: {
          query: {
            limit: 40,
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data.drugs.length).toBe(40);
      expect(data.drugs.at(30).name).toBe('25I-NBF');
    });

    test('Paging offset', async () => {
      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query DrugsWithLimit($query: DrugsQuery) {
            drugs(query: $query) {
              id
              name
            }
          }
        `,
        variables: {
          query: {
            limit: 40,
            offset: 20,
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data.drugs.length).toBe(40);
      expect(data.drugs.at(10).name).toBe('25I-NBF');
    });
  });
});

describe.skip('Drug', () => {
  describe('name', () => {
    test('Returns the default name of a drug when searching by aliases', async () => {
      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query DrugName($query: DrugsQuery) {
            drugs(query: $query) {
              id
              name
            }
          }
        `,
        variables: {
          query: {
            name: 'amfetamine',
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data.drugs.length).toBeLessThan(20);
      expect(data.drugs.at(0).name).toBe('Amphetamine');
    });
  });

  describe('aliases', () => {
    test('Returns all aliases for a particular drug', async () => {
      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query DrugAliases($query: DrugsQuery) {
            drugs(query: $query) {
              aliases {
                name
                type
              }
            }
          }
        `,
        variables: {
          query: {
            id: amphetamineId,
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data.drugs).toEqual([{
        aliases: [
          {
            name: 'amfetamine',
            type: 'COMMON',
          },
          {
            name: 'amph',
            type: 'COMMON',
          },
          {
            name: 'amphetamin',
            type: 'COMMON',
          },
          {
            name: 'amphetamines',
            type: 'COMMON',
          },
          {
            name: 'hearts',
            type: 'COMMON',
          },
          {
            name: 'pep',
            type: 'COMMON',
          },
          {
            name: 'pepp',
            type: 'COMMON',
          },
          {
            name: 'speed',
            type: 'COMMON',
          },
        ],
      }]);
    });
  });

  describe('variants', () => {
    test('Resolves to drug variants', async () => {
      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query DrugVariants($query: DrugsQuery) {
            drugs(query: $query) {
              variants {
                name
              }
            }
          }
        `,
        variables: {
          query: {
            id: amphetamineId,
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data).toEqual({
        drugs: [{
          variants: [{ name: null }],
        }],
      });
    });
  });

  describe('lastUpdatedBy', () => {
    test('Gets user who last updated the record', async () => {
      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query DrugLastUpdatedBy($query: DrugsQuery) {
            drugs(query: $query) {
              lastUpdatedBy {
                nick
              }
            }
          }
        `,
        variables: {
          query: {
            id: amphetamineId,
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data).toEqual({
        drugs: [{
          lastUpdatedBy: {
            nick: 'Moonbear',
          },
        }],
      });
    });
  });
});

describe.skip('drugVariants', () => {
  describe('lastUpdatedBy', () => {
    test('Resolves lastUpdatedBy to user', async () => {
      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query DrugVariantLastUpdatedBy($query: DrugsQuery) {
            drugs(query: $query) {
              id
              variants {
                lastUpdatedBy {
                  nick
                }
              }
            }
          }
        `,
        variables: {
          query: {
            id: amphetamineId,
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data).toEqual({
        drugs: [{
          id: amphetamineId,
          variants: [{
            lastUpdatedBy: {
              nick: 'Moonbear',
            },
          }],
        }],
      });
    });
  });

  describe('roas', () => {
    test('Resolves roas', async () => {
      const { errors, data } = await apolloServer.executeOperation({
        query: gql`
          query VariantRoas($query: DrugsQuery) {
            drugs(query: $query) {
              id
              variants {
                roas {
                  route
                }
              }
            }
          }
        `,
        variables: {
          query: {
            id: amphetamineId,
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data).toEqual({
        drugs: [{
          id: amphetamineId,
          variants: [{
            roas: [
              { route: 'INSUFFLATED' },
              { route: 'ORAL' },
            ],
          }],
        }],
      });
    });
  });
});
