'use strict';

require('dotenv').config();
const path = require('path');

exports.NODE_ENV = process.env.NODE_ENV || 'production';

exports.HTTP_PORT = parseInt(process.env.HTTP_PORT, 10);

exports.LOG_PATH = path.resolve(process.env.LOG_PATH);

exports.POSTGRES_USER = process.env.POSTGRES_USER;
exports.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
exports.POSTGRES_DB = process.env.POSTGRES_DB;
