import { knexSnakeCaseMappers } from 'objection';
import {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} from './env';

export default {
  ...knexSnakeCaseMappers(),
  client: 'pg',
  connection: {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
  },
  migrations: {
    extension: 'ts',
  },
};
