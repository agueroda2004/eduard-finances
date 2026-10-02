import {
  boolean,
  date,
  doublePrecision,
  index,
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

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

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

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    subcategoryId: uuid("subcategory_id").references(() => subcategories.id, {
      onDelete: "set null",
    }),
    amount: doublePrecision("amount").notNull(),
    note: varchar("note", { length: 500 }),
    type: transactionTypeEnum("type").notNull(),
    createdAt: date("created_at").notNull(),
  },
  (table) => [index("Date").on(table.createdAt)],
);

export const transfers = pgTable(
  "transfers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    fromAccountId: uuid("from_account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    toAccountId: uuid("to_account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    amount: doublePrecision("amount").notNull(),
    note: varchar("note", { length: 500 }),
    date: date("date").notNull(),
  },
  (table) => [index("transfers_date_idx").on(table.date)],
);

export type AccountRow = typeof accounts.$inferSelect;
export type NewAccountRow = typeof accounts.$inferInsert;

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;

export type SubcategoryRow = typeof subcategories.$inferSelect;
export type NewSubcategoryRow = typeof subcategories.$inferInsert;

export type TransactionRow = typeof transactions.$inferSelect;
export type NewTransactionRow = typeof transactions.$inferInsert;

export type TransferRow = typeof transfers.$inferSelect;
export type NewTransferRow = typeof transfers.$inferInsert;
