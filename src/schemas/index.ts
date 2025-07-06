import * as chefSchema from "./chef";
import * as historySchema from "./history";
import * as settingSchema from "./setting";

export * from "./chef";
export * from "./history";
export * from "./setting";

export const allSchemas = { ...chefSchema, ...historySchema, ...settingSchema };
