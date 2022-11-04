#!/bin/bash
set -e

TEST_USER="${POSTGRES_USER}_test"
TEST_DATABASE="${POSTGRES_DATABASE}_test"

psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" <<-EOSQL
  CREATE USER ${TEST_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';
  CREATE DATABASE ${POSTGRES_DATABASE};
  CREATE DATABASE ${TEST_DATABASE};
  GRANT ALL PRIVILEGES ON DATABASE ${TEST_DATABASE} TO ${TEST_USER};
EOSQL
