import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { getConfig } from './config';
import { allSchemas } from './schemas';

const config = getConfig();

const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 10,
});

export const db = drizzle(pool, { schema: allSchemas, mode: 'default' });
