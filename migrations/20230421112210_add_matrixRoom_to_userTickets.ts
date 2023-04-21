import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('user_tickets', (table) => {
        table.string('matrix_room').nullable();
        table.string('thread_id').nullable().alter();
      });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('user_tickets', (table) => {
        table.dropColumn('matrix_room');
        table.string('thread_id').notNullable().alter();
      });
}   

