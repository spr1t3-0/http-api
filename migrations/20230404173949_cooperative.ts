import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table
      .boolean('partner')
      .notNullable()
      .defaultTo(false)
      .alter();
    table
      .boolean('supporter')
      .notNullable()
      .defaultTo(false)
      .alter();
  });

  await knex.schema.alterTable('discordGuilds', table => {
    table
      .boolean('partner')
      .defaultTo(false)
      .alter();
    table
      .boolean('supporter')
      .defaultTo(false)
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table
      .boolean('partner')
      .nullable()
      .defaultTo(true)
      .alter();
    table
      .boolean('supporter')
      .nullable()
      .defaultTo(true)
      .alter();
  });

  await knex.schema.alterTable('discordGuilds', table => {
    table
      .boolean('partner')
      .defaultTo(true)
      .alter();
    table
      .boolean('supporter')
      .defaultTo(true)
      .alter();
  });
}
