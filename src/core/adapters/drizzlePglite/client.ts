import path from "node:path";
import {
  RepositoryError,
  RepositoryErrorCode,
} from "@/core/domain/errors/repositoryError.ts";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as Migrator from "drizzle-orm/pglite/migrator";
import * as schema from "./schema.ts";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

export async function getDatabase(databaseUrl?: string) {
  const dirname = import.meta.dirname;

  if (!dirname) {
    console.error("import.meta.dirname environment variable must be set.");
    Deno.exit(1);
  }

  const db = drizzle({
    client: new PGlite(databaseUrl || undefined),
    schema,
  });

  await Migrator.migrate(db, {
    migrationsFolder: path.join(dirname, "migrations"),
  });

  return db;
}

interface DatabaseError {
  code: string;
}

export function isDatabaseError(value: unknown): value is DatabaseError {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if ("code" in value) {
    return true;
  }

  return false;
}

export function mapRepositoryError(error: unknown) {
  const code = isDatabaseError(error) ? error.code : undefined;
  return new RepositoryError(
    code || RepositoryErrorCode.UNKNOWN_ERROR,
    "PGlite Error",
    error,
  );
}
