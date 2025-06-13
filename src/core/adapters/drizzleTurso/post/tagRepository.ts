import { ResultAsync } from "neverthrow";
import { validate } from "@/lib/validation.ts";
import { tagSchema } from "@/core/domain/post/types.ts";
import type { TagRepository } from "@/core/domain/post/port/tagRepository.ts";
import { eq } from "drizzle-orm";
import { type Database, mapRepositoryError } from "../client.ts";
import { tags } from "../schema.ts";

export class DrizzleTursoTagRepository implements TagRepository {
  constructor(private readonly db: Database) {}

  listAll() {
    return ResultAsync.fromPromise(this.db.select().from(tags), (error) =>
      mapRepositoryError(error),
    ).map((results) => ({
      items: results
        .map((result) => validate(tagSchema, result).unwrapOr(null))
        .filter((item) => item !== null),
    }));
  }

  getByName(name: string) {
    return ResultAsync.fromPromise(
      this.db.select().from(tags).where(eq(tags.name, name)).limit(1),
      (error) => mapRepositoryError(error),
    ).map((results) => {
      if (results.length === 0) {
        return null;
      }
      return validate(tagSchema, results[0]).unwrapOr(null);
    });
  }
}
