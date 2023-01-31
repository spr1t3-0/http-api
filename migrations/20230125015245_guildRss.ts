import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rss', table => {
    table
      .uuid('id')
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();

    table
      .text('guildId')
      .notNullable();
    // .references('id')
    // .inTable('discordGuilds');

    table
      .text('url')
      .notNullable();

    table
      .text('lastPostId')
      .notNullable();

    table
      .text('destination')
      .notNullable();

    table.unique(['guildId', 'destination']);
  });

  await knex.schema.alterTable('userTickets', table => {
    table.text('thread_id').alter().notNullable();
    table.text('first_message_id').alter().notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('rss');

  await knex.schema.alterTable('userTickets', table => {
    table.text('thread_id').alter().nullable();
    table.text('first_message_id').alter().nullable();
  });
}
