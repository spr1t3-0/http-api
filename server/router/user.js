'use strict';

const Joi = require('joi');
const argon = require('argon2');

module.exports = function applyUserRoutes(router, { knex, validator }) {
  router.get(
    '/user',

    async (req, res, next) => knex('users')
      .where('deleted', false)
      .select('id', 'email', 'nick', 'joinedAt')
      .orderBy('joinedAt', 'ASC')
      .then(users => res.json({ users }))
      .catch(next),
  );

  router.get(
    '/user/:userId',

    validator.params(Joi.object({
      userId: Joi.string().uuid().required(),
    })
      .required()),

    async (req, res, next) => knex('users')
      .where('deleted', false)
      .select('id', 'email', 'nick', 'joinedAt')
      .first()
      .then(user => {
        if (!user) res.sendStatus(404);
        else res.json({ user });
      })
      .catch(next),
  );

  router.post(
    '/user',

    validator.body(Joi.object({
      email: Joi.string().trim().email().required(),
      nick: Joi.string().trim().min(2),
      password: Joi.string().min(6).required(),
    })
      .required()),

    async (req, res, next) => knex('users')
      .insert({
        email: req.body.email,
        nick: req.body.email,
        passwordHash: await argon.hash(req.body.password),
      })
      .returning(['id', 'email', 'nick', 'lastSeen', 'joinedAt'])
      .then(([newUser]) => {
        res.json(newUser);
      })
      .catch(ex => {
        if (ex.code === 23505) {
          res.status(400).json({
            error: 'An account with that email address already exists.',
          });
        } else next(ex);
      }),
  );

  router.patch(
    '/user/:userId',

    validator.params(Joi.object({
      userId: Joi.string().uuid().required(),
    })
      .required()),

    validator.body(Joi.object({
      password: Joi.string().min(6),
    })
      .required()),

    async (req, res, next) => knex.transaction(async trx => {
      const sql = trx('users').where('id', req.params.userId);
      if (req.body.password) sql.update('passwordHash', await argon.hash(req.body.password));
      await sql;

      return trx('users')
        .where('id', req.params.userId)
        .select('id', 'nick', 'email', 'lastSeen', 'joinedAt')
        .first();
    })
      .then(updatedUser => {
        res.json(updatedUser);
      })
      .catch(next),
  );

  router.delete(
    '/user/:userId',

    validator.params(Joi.object({
      userId: Joi.string().uuid().required(),
    })
      .required()),

    async (req, res, next) => knex('users')
      .where('id', req.params.userId)
      .update('deleted', true)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(next),
  );
};
