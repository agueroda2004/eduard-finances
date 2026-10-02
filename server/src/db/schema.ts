import {
  boolean,
  doublePrecision,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", [
  "cash",
  "credit_card",
  "debit_card",
  "saving",
]);

export const categoryTypeEnum = pgEnum("category_type", ["income", "expense"]);

export const currencyEnum = pgEnum("currency", ["CRC"]);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    balance: doublePrecision("balance"),
    icon: varchar("icon", { length: 50 }).notNull(),
    color: varchar("color", { length: 50 }).notNull(),
    currency: currencyEnum("currency").notNull().default("CRC"),
    active: boolean("active").notNull().default(true),
    type: accountTypeEnum("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("accounts_owner_name_idx").on(table.ownerId, table.name),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 50 }).notNull(),
    color: varchar("color", { length: 50 }).notNull(),
    active: boolean("active").notNull().default(true),
    type: categoryTypeEnum("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_owner_name_idx").on(table.ownerId, table.name),
  ],
);

export const subcategories = pgTable("subcategories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  active: boolean("active").notNull().default(true),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AccountRow = typeof accounts.$inferSelect;
export type NewAccountRow = typeof accounts.$inferInsert;

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;

export type SubcategoryRow = typeof subcategories.$inferSelect;
export type NewSubcategoryRow = typeof subcategories.$inferInsert;
