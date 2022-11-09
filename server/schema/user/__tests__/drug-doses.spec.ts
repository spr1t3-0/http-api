import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
import getTestUsers, { TestUsers } from '../../../../tests/test-users';
import { uuidPattern } from '../../../../tests/patterns';
import type { DrugRecord } from '../../../../db/drug';

let server: ApolloServer;
let knex: Knex;
let users: TestUsers;
let lsd: DrugRecord;
beforeAll(async () => {
  knex = createTestKnex();
  server = createTestServer();
  [users, lsd] = await Promise.all([
    getTestUsers(knex),
    knex<DrugRecord>('drugs')
      .innerJoin('drugNames', 'drugNames.drugId', 'drugs.id')
      .select('drugs.*', 'drugNames.name')
      .where('drugNames.name', 'LSD')
      .andWhere('drugNames.isDefault', true)
      .first(),
  ]);
});

afterAll(async () => knex.destroy());

describe('Mutation', () => {
  test('createUserDrugDose', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation CreateUserDrugDose(
          $userId: UUID!,
          $drugId: UUID!,
          $route: RouteOfAdministration,
          $dose: UnsignedFloat!,
          $units: Units!,
        ) {
          createUserDrugDose(
            userId: $userId,
            drugId: $drugId,
            route: $route,
            dose: $dose,
            units: $units,
          ) {
            id
            user {
              id
              username
            }
            drug {
              id
              name
            }
            route
            dose
            units
            createdAt
          }
        }
      `,
      variables: {
        userId: users.sevenCats.id,
        drugId: lsd.id,
        route: 'ORAL',
        dose: 200,
        units: 'UG',
      },
    }, {
      contextValue: await createTestContext(knex),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      createUserDrugDose: {
        id: expect.stringMatching(uuidPattern),
        user: {
          id: users.sevenCats.id,
          username: users.sevenCats.username,
        },
        drug: {
          id: lsd.id,
          name: 'LSD',
        },
        route: 'ORAL',
        dose: 200,
        units: 'UG',
        createdAt: expect.any(Date),
      },
    });
  });
});
