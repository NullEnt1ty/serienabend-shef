import { type Config } from "drizzle-kit";
import config from "./chef_config.json";

export default {
	schema: "./src/schemas",
	out: "./sql",
	dialect: "mysql",
	dbCredentials: {
		host: config.database.host,
		user: config.database.user,
		password: config.database.password,
		database: config.database.database,
	},
} satisfies Config;
