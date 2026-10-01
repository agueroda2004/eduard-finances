import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/src/db/schema.ts",
  out: "./server/migrations",
  dialect: "postgresql",
});
