import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('user_tickets', (table) => {
        table.string('matrix_room').nullable();
      });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('user_tickets', (table) => {
        table.dropColumn('matrix_room');
      });
}   

