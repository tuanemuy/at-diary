import { ResultAsync } from "neverthrow";
import { validate } from "@/lib/validation.ts";
import type { RepositoryError } from "@/core/domain/errors/repositoryError.ts";
import {
  type PostId,
  type UpsertPostTagParams,
  postTagSchema,
} from "@/core/domain/post/types.ts";
import type { PostTagRepository } from "@/core/domain/post/port/postTagRepository.ts";
import { eq } from "drizzle-orm";
import { type Database, mapRepositoryError } from "../client.ts";
import { tags, postTags } from "../schema.ts";

export class DrizzleTursoPostTagRepository implements PostTagRepository {
  constructor(private readonly db: Database) {}

  upsertMany(params: UpsertPostTagParams) {
    return ResultAsync.fromPromise(
      this.db.transaction(async (tx) => {
        const insertedTags = await tx
          .insert(tags)
          .values(params.names.map((name) => ({ name })))
          .onConflictDoUpdate({
            target: tags.name,
            set: {
              name: tags.name,
            },
          })
          .returning();

        if (insertedTags.length === 0) {
          return [];
        }

        const insertedPostTags = await tx
          .insert(postTags)
          .values(
            insertedTags.map((tag) => ({
              postId: params.postId,
              tagId: tag.id,
            })),
          )
          .onConflictDoNothing()
          .returning();

        return insertedPostTags.map((postTag) => ({
          postTag,
          tag: insertedTags.find((tag) => tag.id === postTag.tagId),
        }));
      }),
      (error) => mapRepositoryError(error),
    ).map((results) =>
      results
        .map((result) =>
          validate(postTagSchema, {
            id: result.postTag.id,
            postId: result.postTag.postId,
            tag: result.tag,
          }).unwrapOr(null),
        )
        .filter((item) => item !== null),
    );
  }

  deleteByPostId(postId: PostId): ResultAsync<void, RepositoryError> {
    return ResultAsync.fromPromise(
      this.db.delete(postTags).where(eq(postTags.postId, postId)),
      (error) => mapRepositoryError(error),
    ).map(() => undefined);
  }
}
