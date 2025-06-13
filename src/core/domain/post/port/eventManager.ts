import type { Result, ResultAsync } from "neverthrow";
import type { JsonValue } from "@/lib/json.ts";
import type { PostCommitEvent, CreatePostCommit } from "../types.ts";
import type { EventManagerError } from "../../errors/eventManagerError.ts";

export interface EventManager {
  parseEvent(json: JsonValue): Result<PostCommitEvent, EventManagerError>;
  renderPost(commit: CreatePostCommit): ResultAsync<
    {
      text: string;
      tags: string[];
    },
    EventManagerError
  >;
}
