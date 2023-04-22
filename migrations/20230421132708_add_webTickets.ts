import { Knex } from "knex";
import cron from 'node-cron';

export async function up(knex: Knex): Promise<void> {
    knex.schema.createTable('web_users', function(table) {
        table.string('id');
        table.string('username');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    }).then(() => {
         // Use a raw SQL statement to set the onUpdate trigger
         return knex.raw(`
         CREATE OR REPLACE FUNCTION set_updated_at()
         RETURNS TRIGGER AS $$
         BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
         END;
         $$ LANGUAGE plpgsql;
     
         CREATE TRIGGER set_updated_at_trigger
         BEFORE UPDATE ON web_users
         FOR EACH ROW
         EXECUTE FUNCTION set_updated_at();
       `);
    })
    knex.schema.createTable('web_tickets', function(table) {
        table.increments('id').primary();
        table.string('matrix_roomId');
        table.string('matrix_metaRoomId').nullable();
        table.string('discord_threadId').nullable();
        table.string('discord_metaThreadId').nullable();
        table.string('userID');
        table.string('status').defaultTo('OPEN');
        table.timestamp('closed_at').nullable();
        table.timestamp('deleted_at').nullable();
        table.string('closed_by').nullable();
        table.string('reopened_by').nullable();
        table.timestamp('reopened_at').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

    }).then(() => {
         // Use a raw SQL statement to set the onUpdate trigger
         return knex.raw(`
         CREATE OR REPLACE FUNCTION set_updated_at()
         RETURNS TRIGGER AS $$
         BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
         END;
         $$ LANGUAGE plpgsql;
     
         CREATE TRIGGER set_updated_at_trigger
         BEFORE UPDATE ON web_tickets
         FOR EACH ROW
         EXECUTE FUNCTION set_updated_at();
       `);
    });
}


export async function down(knex: Knex): Promise<void> {
  knex.raw(`
  DROP TRIGGER IF EXISTS set_updated_at_trigger ON web_users;
  DROP FUNCTION IF EXISTS set_updated_at();
`);

 knex.raw(`
DROP TRIGGER IF EXISTS set_updated_at_trigger ON web_tickets;
DROP FUNCTION IF EXISTS set_updated_at();
`);
knex.schema.dropTable('web_users');
knex.schema.dropTable('web_tickets');
}

