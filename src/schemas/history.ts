import { datetime, index, int, mysqlTable } from "drizzle-orm/mysql-core";
import { chef } from "./chef";
import { relations } from "drizzle-orm";

export const history = mysqlTable(
	"History",
	{
		id: int("id").autoincrement().notNull(),
		date: datetime("date", { mode: "date" }).notNull(),
		numberOfPersons: int("numberOfPersons").notNull(),
		chefId: int("chefId")
			.notNull()
			.references(() => chef.id, { onDelete: "restrict", onUpdate: "cascade" }),
	},
	(table) => {
		return {
			historyIbfkChefId: index("history_ibfk_chef_id").on(table.chefId),
		};
	},
);

export const historyRelations = relations(history, ({ one }) => ({
	chef: one(chef, {
		fields: [history.chefId],
		references: [chef.id],
	}),
}));

export type History = typeof history.$inferSelect;
export type NewHistory = typeof history.$inferInsert;
