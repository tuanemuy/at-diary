import { ResultAsync } from "neverthrow";
import { validate } from "@/lib/validation.ts";
import {
  RepositoryError,
  RepositoryErrorCode,
} from "@/core/domain/errors/repositoryError.ts";
import {
  type DID,
  type Post,
  type CreatePostParams,
  type ListPostQuery,
  type ListPostByTagQuery,
  postSchema,
} from "@/core/domain/post/types.ts";
import type { PostRepository } from "@/core/domain/post/port/postRepository.ts";
import { and, eq, like, sql } from "drizzle-orm";
import { type Database, mapRepositoryError } from "../client.ts";
import { posts, postTags } from "../schema.ts";

export class DrizzleTursoPostRepository implements PostRepository {
  constructor(private readonly db: Database) {}

  create(post: CreatePostParams): ResultAsync<Post, RepositoryError> {
    return ResultAsync.fromPromise(
      this.db.insert(posts).values(post).returning(),
      (error) => mapRepositoryError(error),
    ).andThen((results) =>
      validate(postSchema, results[0]).mapErr(
        (error) =>
          new RepositoryError(
            RepositoryErrorCode.DATA_ERROR,
            "Post validation failed",
            error,
          ),
      ),
    );
  }

  list(
    query: ListPostQuery,
  ): ResultAsync<{ items: Post[]; count: number }, RepositoryError> {
    const { pagination, filter } = query;
    const limit = pagination.limit;
    const offset = (pagination.page - 1) * pagination.limit;

    const filters = [
      filter?.text ? like(posts.text, `%${filter.text}%`) : undefined,
    ].filter((filter) => filter !== undefined);

    return ResultAsync.fromPromise(
      Promise.all([
        this.db
          .select()
          .from(posts)
          .where(and(...filters))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql`count(*)` })
          .from(posts)
          .where(and(...filters)),
      ]),
      (error) => mapRepositoryError(error),
    ).map(([items, countResult]) => ({
      items: items
        .map((item) => validate(postSchema, item).unwrapOr(null))
        .filter((item) => item !== null),
      count: Number(countResult[0].count),
    }));
  }

  listByTag(
    query: ListPostByTagQuery,
  ): ResultAsync<{ items: Post[]; count: number }, RepositoryError> {
    const { pagination, tagId } = query;
    const limit = pagination.limit;
    const offset = (pagination.page - 1) * pagination.limit;

    return ResultAsync.fromPromise(
      Promise.all([
        this.db
          .select()
          .from(posts)
          .innerJoin(postTags, eq(posts.id, postTags.postId))
          .where(eq(postTags.tagId, tagId))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql`count(*)` })
          .from(posts)
          .innerJoin(postTags, eq(posts.id, postTags.postId))
          .where(eq(postTags.tagId, tagId)),
      ]),
      (error) => mapRepositoryError(error),
    ).map(([items, countResult]) => {
      return {
        items: items
          .map(({ posts }) => validate(postSchema, posts).unwrapOr(null))
          .filter((item) => item !== null),
        count: Number(countResult[0].count),
      };
    });
  }

  deleteByDid(did: DID): ResultAsync<void, RepositoryError> {
    return ResultAsync.fromPromise(
      this.db.delete(posts).where(eq(posts.did, did)),
      (error) => mapRepositoryError(error),
    ).map(() => undefined);
  }
}
