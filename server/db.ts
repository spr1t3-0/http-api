import { Knex } from 'knex';
import type { UserRecord } from './schema/user/user';

export default function createDb(knex: Knex) {
  return {
    getUserById(id: string) {
      return knex<UserRecord>('users')
        .where('id', id)
        .first();
    },
  };
}
