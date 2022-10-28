# TripSit API

Centralized API 


## Setup

1. `git clone git@github.com:TripSit/http-api.git`
1. `cd http-api`
1. `npm i`
1. `docker-compose up -d`
1. `cp .env.example .env`
1. `npx knex migrate:latest`
1. `npx knex seed:run`
