import { defineConfig } from "drizzle-kit";

const url = Deno.env.get("TURSO_DATABASE_URL");
const authToken = Deno.env.get("TURSO_DATABASE_AUTH_TOKEN");

if (!url || !authToken) {
  console.error(
    "TURSO_DATABASE_URL and TURSO_DATABASE_AUTH_TOKEN environment variables must be set.",
  );
  Deno.exit(1);
}

export default defineConfig({
  out: "./src/core/adapters/drizzleTurso/migrations",
  schema: "./src/core/adapters/drizzleTurso/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url,
    authToken,
  },
});
