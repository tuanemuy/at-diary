import * as path from "jsr:@std/path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const url = Deno.env.get("PGLITE_DATABASE_URL");
const dirname = import.meta.dirname;

if (!dirname) {
  console.error("import.meta.dirname environment variable must be set.");
  Deno.exit(1);
}

const db = drizzle(new PGlite(url || undefined));

await migrate(db, {
  migrationsFolder: path.join(dirname, "migrations"),
});

console.info("Migration completed");
