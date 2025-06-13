import { type Result, ok, err, ResultAsync } from "neverthrow";
import type { EventManager } from "@/core/domain/post/port/eventManager.ts";
import type {
  PostCommitEvent,
  CreatePostCommit,
} from "@/core/domain/post/types.ts";
import type { JsonValue } from "@/lib/json.ts";
import { EventManagerError } from "@/core/domain/errors/eventManagerError.ts";

export class MockEventManager implements EventManager {
  private shouldError = false;
  private shouldParseError = false;
  private mockEvent: PostCommitEvent | null = null;
  private mockRenderResult: { text: string; tags: string[] } = {
    text: "Default mock text",
    tags: ["tech", "life"],
  };

  setError(shouldError: boolean) {
    this.shouldError = shouldError;
  }

  setParseError(shouldParseError: boolean) {
    this.shouldParseError = shouldParseError;
  }

  setMockEvent(event: PostCommitEvent) {
    this.mockEvent = event;
  }

  setMockRenderResult(result: { text: string; tags: string[] }) {
    this.mockRenderResult = result;
  }

  parseEvent(_json: JsonValue): Result<PostCommitEvent, EventManagerError> {
    if (this.shouldParseError) {
      return err(new EventManagerError("eventManager", "Mock parse error"));
    }

    if (!this.mockEvent) {
      return err(new EventManagerError("eventManager", "No mock event set"));
    }

    return ok(this.mockEvent);
  }

  renderPost(
    commit: CreatePostCommit,
  ): ResultAsync<{ text: string; tags: string[] }, EventManagerError> {
    if (this.shouldError) {
      return ResultAsync.fromPromise(
        Promise.reject(
          new EventManagerError("eventManager", "Mock render error"),
        ),
        (error) => error as EventManagerError,
      );
    }

    return ResultAsync.fromSafePromise(
      Promise.resolve({
        text: this.mockRenderResult.text || commit.record.text,
        tags: this.mockRenderResult.tags,
      }),
    );
  }
}
