import knex, { Knex } from 'knex';
import knexConfig from '../../knexfile';

export default function createTestKnex() {
  const connection = knexConfig.connection as Knex.PgConnectionConfig;

  return knex({
    ...knexConfig,
    connection: {
      ...connection,
      user: `${connection.user}_test`,
      database: `${connection.database}_test`,
    },
  });
}
