// @flow
import SequelizeCockroach from 'sequelize-cockroachdb';
import type Sequelize from 'sequelize';

const {
  COCKROACHDB_HOST,
  COCKROACHDB_PW,
  LOCAL_DB_HOST,
  LOCAL_PW,
} = process.env;
const { APP_ENV } = process.env;

const host = APP_ENV === 'local' ? LOCAL_DB_HOST : COCKROACHDB_HOST;
const pw = APP_ENV === 'local' ? LOCAL_PW : COCKROACHDB_PW;
const db:Sequelize = new SequelizeCockroach('jeckson', 'jeckson', pw, {
  host,
  dialect: 'postgres',
  port: 26257,
  loggin: true,
  ssl: true,
  dialectOptions: {
    ssl: true,
  },
});

export default db;
