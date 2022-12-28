import { Knex, knex as _knex } from 'knex';
import { Chef, History, Setting } from './types';

const config: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'test',
    password: 'test',
    database: 'test',
  },
};

export const knex = _knex(config);

declare module 'knex/types/tables' {
  interface Tables {
    Chef: Chef;
    History: History;
    Setting: Setting;
  }
}
