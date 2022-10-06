'use strict';

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema
    .createTable('users', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .string('email', 320)
        .notNullable()
        .unique()
        .index();

      table
        .string('nick', 32)
        .notNullable()
        .unique()
        .index();

      table
        .text('passwordHash')
        .notNullable();

      table
        .timestamp('lastSeen')
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('joinedAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('drugs', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table.text('summary');
      table.text('psychonautWikiUrl');
      table.text('errowidExperiencesUrl');

      table
        .uuid('lastUpdatedBy')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .timestamp('updatedAt')
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('drugNames', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('drugId')
        .notNullable()
        .references('id')
        .inTable('drugs')
        .onDelete('CASCADE');

      table
        .text('name')
        .notNullable();

      // TODO: Check constraint
      table
        .boolean('default')
        .notNullable()
        .defaultTo(false);

      table
        .enum('type', [
          'COMMON',
          'SUBSTITUTIVE',
          'SYSTEMATIC',
        ], {
          useNative: true,
          enumName: 'drug_name_type',
        })
        .notNullable()
        .defaultTo('COMMON');
    })
    .createTable('drugVariants', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('drugId')
        .notNullable()
        .references('id')
        .inTable('drugs')
        .onDelete('CASCADE');

      table.text('name');
      table.text('description');

      // TODO: Check constraint
      table
        .boolean('default')
        .notNullable()
        .defaultTo(false);

      table
        .uuid('lastUpdatedBy')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .timestamp('updatedAt')
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('drugVariantRoas', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('drugVariantId')
        .notNullable()
        .references('id')
        .inTable('drugVariants')
        .onDelete('CASCADE');

      table
        .enum('route', [
          'ORAL',
          'INSUFFLATED',
          'INHALED',
          'TOPICAL',
          'SUBLINGUAL',
          'BUCCAL',
          'RECTAL',
          'INTRAMUSCULAR',
          'INTRAVENOUS',
          'SUBCUTANIOUS',
          'TRANSDERMAL',
        ], {
          useNative: true,
          enumName: 'drug_roa',
        })
        .notNullable();

      table.float('doseThreshold');
      table.float('doseLight');
      table.float('doseCommon');
      table.float('doseStrong');
      table.float('doseHeavy');
      table.text('doseWarning');

      table.float('durationTotalMin');
      table.float('durationTotalMax');
      table.float('durationOnsetMin');
      table.float('durationOnsetMax');
      table.float('durationComeupMin');
      table.float('durationComeupMax');
      table.float('durationPeakMin');
      table.float('durationPeakMax');
      table.float('durationOffsetMin');
      table.float('durationOffsetMax');
      table.float('durationAfterEffectsMin');
      table.float('durationAfterEffectsMax');
    });
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = async function down(knex) {
  await knex.schema
    .dropTableIfExists('drugVariantRoas')
    .dropTableIfExists('drugVariants')
    .dropTableIfExists('drugNames')
    .dropTableIfExists('drugs')
    .dropTableIfExists('users');

  await knex.raw('DROP TYPE IF EXISTS "drug_roa"');
  await knex.raw('DROP TYPE IF EXISTS "drug_name_type"');

  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};
