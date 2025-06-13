import type { ResultAsync } from "neverthrow";
import type { RepositoryError } from "@/core/domain/errors/repositoryError.ts";
import type { Tag } from "../types.ts";

export interface TagRepository {
  listAll(): ResultAsync<{ items: Tag[] }, RepositoryError>;
  getByName(name: string): ResultAsync<Tag | null, RepositoryError>;
}
