import { longtext, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const setting = mysqlTable('Setting', {
  settingsKey: varchar('settingsKey', { length: 255 }).notNull(),
  settingsValue: longtext('settingsValue').default('NULL'),
});

export type Setting = typeof setting.$inferSelect;
export type NewSetting = typeof setting.$inferInsert;

export enum Settings {
  EnforcedNextChef = 'EnforcedNextChef',
  LinkedChatId = 'LinkedChatId',
}
