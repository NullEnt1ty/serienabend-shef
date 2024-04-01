import { relations } from 'drizzle-orm';
import { int, mysqlTable, unique, varchar } from 'drizzle-orm/mysql-core';
import { history } from './history';

export const chef = mysqlTable(
  'Chef',
  {
    id: int('id').autoincrement().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    points: int('points').default(0).notNull(),
  },
  (table) => {
    return {
      name: unique('name').on(table.name),
    };
  },
);

export const chefRelations = relations(chef, ({ many }) => ({
  history: many(history),
}));

export type Chef = typeof chef.$inferSelect;
export type NewChef = typeof chef.$inferInsert;
