import type { ResultAsync } from "neverthrow";
import type { RepositoryError } from "@/core/domain/errors/repositoryError.ts";
import type { PostId, PostTag, UpsertPostTagParams } from "../types.ts";

export interface PostTagRepository {
  upsertMany(
    params: UpsertPostTagParams,
  ): ResultAsync<PostTag[], RepositoryError>;
  deleteByPostId(postId: PostId): ResultAsync<void, RepositoryError>;
}
