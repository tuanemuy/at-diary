import { ResultAsync } from "neverthrow";
import type { TagRepository } from "@/core/domain/post/port/tagRepository.ts";
import { type Tag, tagIdSchema } from "@/core/domain/post/types.ts";
import { RepositoryError } from "@/core/domain/errors/repositoryError.ts";

export class MockTagRepository implements TagRepository {
  private tags: Tag[] = [];
  private shouldError = false;

  setError(shouldError: boolean) {
    this.shouldError = shouldError;
  }

  setTags(tags: Tag[]) {
    this.tags = tags;
  }

  addTag(tag: Tag) {
    this.tags.push(tag);
  }

  clearTags() {
    this.tags = [];
  }

  listAll(): ResultAsync<{ items: Tag[] }, RepositoryError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new RepositoryError("tagRepository", "Mock listAll error"),
        ),
        (error) => error as RepositoryError,
      );
    }

    return ResultAsync.fromSafePromise(Promise.resolve({ items: this.tags }));
  }

  getByName(name: string): ResultAsync<Tag | null, RepositoryError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new RepositoryError("tagRepository", "Mock getByName error"),
        ),
        (error) => error as RepositoryError,
      );
    }

    const tag = this.tags.find((t) => t.name === name) || null;
    return ResultAsync.fromSafePromise(Promise.resolve(tag));
  }

  create(name: string): ResultAsync<Tag, RepositoryError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new RepositoryError("tagRepository", "Mock create error"),
        ),
        (error) => error as RepositoryError,
      );
    }

    const tag: Tag = {
      id: tagIdSchema.parse(crypto.randomUUID()),
      name,
    };

    this.tags.push(tag);
    return ResultAsync.fromSafePromise(Promise.resolve(tag));
  }

  upsertMany(names: string[]): ResultAsync<Tag[], RepositoryError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new RepositoryError("tagRepository", "Mock upsertMany error"),
        ),
        (error) => error as RepositoryError,
      );
    }

    const newTags: Tag[] = [];

    for (const name of names) {
      let tag = this.tags.find((t) => t.name === name);
      if (!tag) {
        tag = {
          id: tagIdSchema.parse(crypto.randomUUID()),
          name,
        };
        this.tags.push(tag);
      }
      newTags.push(tag);
    }

    return ResultAsync.fromSafePromise(Promise.resolve(newTags));
  }
}
