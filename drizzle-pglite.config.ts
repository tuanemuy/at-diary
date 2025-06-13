import { defineConfig } from "drizzle-kit";

const url = Deno.env.get("PGLITE_DATABASE_URL");

export default defineConfig({
  out: "./src/core/adapters/drizzlePglite/migrations",
  schema: "./src/core/adapters/drizzlePglite/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: url || "",
  },
});
