# TripSit API

Centralized API 

## Setup

1. `git clone git@github.com:TripSit/http-api.git`
2. `cd http-api`
3. `npm i`
4. `cp .env.example .env`
5. `npx run setup`
6. `docker-compose up -d`
7. `npx knex migrate:latest`
8. `npx knex seed:run`
9. (Optional) `npx run db-types`

## Development
If you make changes to the .init file make sure to run `npx run reset-db`!

## Development
If you make changes to the .init file make sure to run `npx run reset-db`!
