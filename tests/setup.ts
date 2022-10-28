import createTestKnex from './utils/test-knex';

async function createTestDatabase() {
  const knex = createTestKnex();

  try {
    await knex.migrate.rollback(undefined, true);
    await knex.migrate.latest();
    await knex.seed.run();
  } finally {
    await knex.destroy();
  }
}

export default async function setupJest() {
  await createTestDatabase();
}
