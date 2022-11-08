import createKnex, { Knex } from 'knex';
import knexConfig from '../knexfile';
import { POSTGRES_USER, POSTGRES_DB } from '../env';

export default function createTestKnex() {
  return createKnex({
    ...knexConfig,
    connection: {
      ...knexConfig.connection,
      user: `${POSTGRES_USER}_test`,
      database: `${POSTGRES_DB}_test`,
    },
  });
}

export async function resetDb(knex: Knex) {
  await knex.migrate.rollback(undefined, true);
  await knex.migrate.latest();
  await knex.seed.run();
}
