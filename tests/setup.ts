import createTestKnex, { resetDb } from './test-knex';

async function createTestDatabase() {
  const knex = createTestKnex();
  try {
    await resetDb(knex);
  } catch (ex) {
    console.error('Database error:', ex); // eslint-disable-line
    await knex.destroy();
    process.exit(1);
  } finally {
    await knex.destroy();
  }
}

export default async function setupJest() {
  await createTestDatabase();
}
