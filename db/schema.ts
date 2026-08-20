import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  pricePaise: integer("price_paise").notNull(),
  material: text("material").notNull(),
  size: text("size").notNull(),
  care: text("care").notNull(),
  imageUrl: text("image_url").notNull(),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});
