import { ResultAsync } from "neverthrow";
import type { PostTagRepository } from "@/core/domain/post/port/postTagRepository.ts";
import {
  type PostId,
  type PostTag,
  type UpsertPostTagParams,
  postTagIdSchema,
  tagIdSchema,
} from "@/core/domain/post/types.ts";
import { RepositoryError } from "@/core/domain/errors/repositoryError.ts";

export class MockPostTagRepository implements PostTagRepository {
  private postTags: PostTag[] = [];
  private shouldError = false;

  setError(shouldError: boolean) {
    this.shouldError = shouldError;
  }

  setPostTags(postTags: PostTag[]) {
    this.postTags = postTags;
  }

  addPostTag(postTag: PostTag) {
    this.postTags.push(postTag);
  }

  clearPostTags() {
    this.postTags = [];
  }

  upsertMany(
    params: UpsertPostTagParams,
  ): ResultAsync<PostTag[], RepositoryError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new RepositoryError("postTagRepository", "Mock upsert error"),
        ),
        (error) => error as RepositoryError,
      );
    }

    const newPostTags: PostTag[] = params.names.map((name) => ({
      id: postTagIdSchema.parse(crypto.randomUUID()),
      postId: params.postId,
      tag: {
        id: tagIdSchema.parse(crypto.randomUUID()),
        name,
      },
    }));

    this.postTags.push(...newPostTags);
    return ResultAsync.fromSafePromise(Promise.resolve(newPostTags));
  }

  deleteByPostId(postId: PostId): ResultAsync<void, RepositoryError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new RepositoryError("postTagRepository", "Mock deleteByPostId error"),
        ),
        (error) => error as RepositoryError,
      );
    }

    this.postTags = this.postTags.filter(
      (postTag) => postTag.postId !== postId,
    );
    return ResultAsync.fromSafePromise(Promise.resolve(undefined));
  }
}
