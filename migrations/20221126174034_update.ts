import { Knex } from 'knex';

// function formatAlterTableEnumSql(tableName: string, columnName: string, enums: string[]): string {
//   const constraintName = `${tableName}_${columnName}_check`;
//   const checkValues = enums.map(enu => `'${enu}'::text`);
//   const checkValuesString = checkValues.join(', ');
//   return `
//     ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}";
//     ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" CHECK ("${columnName}" = ANY (ARRAY[${checkValuesString}]));
//   `;
// }

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table.text('lastSeenIn').alter();
  });
  await knex.schema.alterTable('userExperience', table => {
    table.unique(['userId', 'type']);
    table.dropNullable('type');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table.timestamp('lastSeenIn').alter();
  });
  await knex.schema.alterTable('userExperience', table => {
  // table.unique(['id', 'userId', 'type']);
    table.setNullable('type');
  });
}
