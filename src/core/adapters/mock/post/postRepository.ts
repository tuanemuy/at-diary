import { ResultAsync } from "neverthrow";
import type { PostRepository } from "@/core/domain/post/port/postRepository.ts";
import {
  type Post,
  type CreatePostParams,
  type ListPostQuery,
  type ListPostByTagQuery,
  type DID,
  postIdSchema,
  didSchema,
  rkeySchema,
} from "@/core/domain/post/types.ts";
import { RepositoryError } from "@/core/domain/errors/repositoryError.ts";

export class MockPostRepository implements PostRepository {
  private posts: Post[] = [];
  private shouldError = false;

  setError(shouldError: boolean) {
    this.shouldError = shouldError;
  }

  setPosts(posts: Post[]) {
    this.posts = posts;
  }

  addPost(post: Post) {
    this.posts.push(post);
  }

  clearPosts() {
    this.posts = [];
  }

  create(params: CreatePostParams): ResultAsync<Post, RepositoryError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new RepositoryError("postRepository", "Mock create error"),
        ),
        (error) => error as RepositoryError,
      );
    }

    const post: Post = {
      id: postIdSchema.parse(crypto.randomUUID()),
      did: didSchema.parse(params.did),
      rkey: rkeySchema.parse(params.rkey),
      text: params.text,
      postedAt: params.postedAt,
    };

    this.posts.push(post);
    return ResultAsync.fromSafePromise(Promise.resolve(post));
  }

  list(
    query: ListPostQuery,
  ): ResultAsync<{ items: Post[]; count: number }, RepositoryError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new RepositoryError("postRepository", "Mock list error"),
        ),
        (error) => error as RepositoryError,
      );
    }

    const { pagination, filter } = query;
    let filteredPosts = this.posts;

    if (filter?.text) {
      filteredPosts = this.posts.filter((post) =>
        post.text.toLowerCase().includes(filter.text?.toLowerCase() ?? ""),
      );
    }

    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const items = filteredPosts.slice(startIndex, endIndex);

    return ResultAsync.fromSafePromise(
      Promise.resolve({ items, count: filteredPosts.length }),
    );
  }

  listByTag(
    query: ListPostByTagQuery,
  ): ResultAsync<{ items: Post[]; count: number }, RepositoryError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new RepositoryError("postRepository", "Mock listByTag error"),
        ),
        (error) => error as RepositoryError,
      );
    }

    const { pagination, tagId } = query;
    // Filter posts by tagId (simplified mock logic)
    const filteredPosts = this.posts.filter((post) =>
      // In real implementation, this would check post-tag relationships
      post.text.includes(`#${tagId}`),
    );

    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const items = filteredPosts.slice(startIndex, endIndex);

    return ResultAsync.fromSafePromise(
      Promise.resolve({ items, count: filteredPosts.length }),
    );
  }

  deleteByDid(did: DID): ResultAsync<void, RepositoryError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new RepositoryError("postRepository", "Mock deleteByDid error"),
        ),
        (error) => error as RepositoryError,
      );
    }

    this.posts = this.posts.filter((post) => post.did !== did);
    return ResultAsync.fromSafePromise(Promise.resolve(undefined));
  }
}
