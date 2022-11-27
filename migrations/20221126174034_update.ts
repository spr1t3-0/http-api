import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table.text('lastSeenIn').alter();
  });
  await knex.schema.alterTable('userExperience', table => {
    table.unique(['userId', 'type']);
    table.enum('type', [
      'TOTAL',
      'GENERAL',
      'TRIPSITTER',
      'DEVELOPER',
      'TEAM',
      'IGNORED',
    ], {
      useNative: true,
      enumName: 'experience_type',
    })
      .alter()
      .notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table.timestamp('lastSeenIn').alter();
  });
  await knex.schema.alterTable('userExperience', table => {
    table.unique(['id', 'userId', 'type']);
    table.enum('type', [
      'TOTAL',
      'GENERAL',
      'TRIPSITTER',
      'DEVELOPER',
      'TEAM',
      'IGNORED',
    ], {
      useNative: true,
      enumName: 'experience_type',
    });
  });
}
