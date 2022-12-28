import { knex as _knex } from 'knex';
import { getConfig } from './config';
import { Chef, History, Setting } from './types';

export const knex = _knex({
  client: 'mysql2',
  connection: () => {
    const config = getConfig();
    return config.database;
  },
});

declare module 'knex/types/tables' {
  interface Tables {
    Chef: Chef;
    History: History;
    Setting: Setting;
  }
}
