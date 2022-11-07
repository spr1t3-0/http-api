import type { Knex } from 'knex';
import type { UserRecord } from '../db/user';

export interface TestUsers {
  moonBear: UserRecord;
  sevenCats: UserRecord;
  ajar: UserRecord;
}

export default async function getTestUsers(knex: Knex): Promise<TestUsers> {
  return knex<UserRecord>('users')
    .whereIn('username', ['MoonBear', 'SevenCats', 'AJAr'])
    .then((users) => ({
      moonBear: users.find((user) => user.username === 'MoonBear')!,
      sevenCats: users.find((user) => user.username === 'SevenCats')!,
      ajar: users.find((user) => user.username === 'AJAr')!,
    }));
}
