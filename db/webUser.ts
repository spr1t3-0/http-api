export default function createWebUserDb(knex: Knex) {
    return {
      getById(id: string) {
        return knex<UserRecord>('users')
          .where('id', id)
          .first();
      },
    };
  }
  