import type { ResultAsync } from "neverthrow";
import type { Tag } from "@/core/domain/post/types.ts";
import { ApplicationError } from "../error.ts";
import type { Context } from "../context.ts";

export function listTags(
  context: Context,
): ResultAsync<{ items: Tag[] }, ApplicationError> {
  const { tagRepository } = context.deps;

  return tagRepository
    .listAll()
    .mapErr(
      (error) => new ApplicationError("listTags", "Failed to list tags", error),
    );
}
