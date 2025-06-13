import type { ResultAsync } from "neverthrow";
import type { RepositoryError } from "@/core/domain/errors/repositoryError.ts";
import type {
  DID,
  Post,
  CreatePostParams,
  ListPostQuery,
  ListPostByTagQuery,
} from "../types.ts";

export interface PostRepository {
  create(post: CreatePostParams): ResultAsync<Post, RepositoryError>;
  list(
    query: ListPostQuery,
  ): ResultAsync<{ items: Post[]; count: number }, RepositoryError>;
  listByTag(
    query: ListPostByTagQuery,
  ): ResultAsync<{ items: Post[]; count: number }, RepositoryError>;
  deleteByDid(id: DID): ResultAsync<void, RepositoryError>;
}
