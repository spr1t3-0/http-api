import createKnex, { Knex } from 'knex';
import knexConfig from '../knexfile';
import createUserDb from './user';
import createDrugDb from './drug';

export default function createDb(knex: Knex = createKnex(knexConfig)) {
  return {
    knex,
    user: createUserDb(knex),
    drug: createDrugDb(knex),
  };
}

export type Db = ReturnType<typeof createDb>;
