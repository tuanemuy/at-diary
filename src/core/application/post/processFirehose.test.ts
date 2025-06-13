import { describe, it, beforeEach, afterEach } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { processFirehose } from "./processFirehose.ts";
import type { Context } from "../context.ts";
import {
  type PostCommitEvent,
  type CreatePostCommit,
  didSchema,
  rkeySchema,
} from "@/core/domain/post/types.ts";
import { ApplicationError } from "../error.ts";
import {
  createTestContext,
  getTestDataHelper,
} from "@/core/test/testHelper.ts";

describe("processFirehose with Mock Adapters", () => {
  let context: Context & { cleanup: () => void };
  let testHelper: ReturnType<typeof getTestDataHelper>;

  beforeEach(() => {
    context = createTestContext();
    testHelper = getTestDataHelper(context);
  });

  afterEach(() => {
    context.cleanup();
  });

  it("should process create post commit successfully", async () => {
    const createCommit: CreatePostCommit = {
      rev: "rev-1",
      operation: "create",
      collection: "app.bsky.feed.post",
      rkey: rkeySchema.parse("rkey-1"),
      record: {
        $type: "app.bsky.feed.post",
        createdAt: "2024-01-01T00:00:00Z",
        text: "Hello world #tech #life",
      },
      cid: "cid-1",
    };

    const mockEvent: PostCommitEvent = {
      did: didSchema.parse("did:example:123"),
      time_us: 1640995200000000,
      kind: "commit",
      commit: createCommit,
    };

    testHelper.eventManager.setMockEvent(mockEvent);

    const input = {
      data: JSON.stringify(mockEvent),
    };

    const result = await processFirehose(input, context);

    expect(result.isOk()).toBe(true);
  });

  it("should handle create post with tags", async () => {
    const createCommit: CreatePostCommit = {
      rev: "rev-1",
      operation: "create",
      collection: "app.bsky.feed.post",
      rkey: rkeySchema.parse("rkey-1"),
      record: {
        $type: "app.bsky.feed.post",
        createdAt: "2024-01-01T00:00:00Z",
        text: "Hello world #tech #life",
      },
      cid: "cid-1",
    };

    const mockEvent: PostCommitEvent = {
      did: didSchema.parse("did:example:123"),
      time_us: 1640995200000000,
      kind: "commit",
      commit: createCommit,
    };

    testHelper.eventManager.setMockEvent(mockEvent);

    const input = {
      data: JSON.stringify(mockEvent),
    };

    const result = await processFirehose(input, context);

    expect(result.isOk()).toBe(true);
  });

  it("should process delete post commit successfully", async () => {
    const deleteCommit = {
      rev: "rev-1",
      operation: "delete" as const,
      collection: "app.bsky.feed.post" as const,
      rkey: rkeySchema.parse("rkey-1"),
    };

    const mockEvent: PostCommitEvent = {
      did: didSchema.parse("did:example:123"),
      time_us: 1640995200000000,
      kind: "commit",
      commit: deleteCommit,
    };

    testHelper.eventManager.setMockEvent(mockEvent);

    const input = {
      data: JSON.stringify(mockEvent),
    };

    const result = await processFirehose(input, context);

    expect(result.isOk()).toBe(true);
  });

  it("should handle invalid JSON input", async () => {
    const input = {
      data: "invalid json",
    };

    const result = await processFirehose(input, context);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error.usecase).toBe("processFirehose");
      expect(result.error.message).toBe("Failed to parse event");
    }
  });

  it("should handle event parsing error", async () => {
    testHelper.eventManager.setParseError(true);

    const input = {
      data: JSON.stringify({ some: "data" }),
    };

    const result = await processFirehose(input, context);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error.usecase).toBe("processFirehose");
      expect(result.error.message).toBe("Failed to parse event");
    }
  });

  it("should handle post creation error", async () => {
    const createCommit: CreatePostCommit = {
      rev: "rev-1",
      operation: "create",
      collection: "app.bsky.feed.post",
      rkey: rkeySchema.parse("rkey-1"),
      record: {
        $type: "app.bsky.feed.post",
        createdAt: "2024-01-01T00:00:00Z",
        text: "Hello world",
      },
      cid: "cid-1",
    };

    const mockEvent: PostCommitEvent = {
      did: didSchema.parse("did:example:123"),
      time_us: 1640995200000000,
      kind: "commit",
      commit: createCommit,
    };

    testHelper.eventManager.setMockEvent(mockEvent);
    testHelper.postRepository.setError(true);

    const input = {
      data: JSON.stringify(mockEvent),
    };

    const result = await processFirehose(input, context);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error.usecase).toBe("processFirehose");
      expect(result.error.message).toBe("Failed to create post");
    }
  });

  it("should handle post deletion error", async () => {
    const deleteCommit = {
      rev: "rev-1",
      operation: "delete" as const,
      collection: "app.bsky.feed.post" as const,
      rkey: rkeySchema.parse("rkey-1"),
    };

    const mockEvent: PostCommitEvent = {
      did: didSchema.parse("did:example:123"),
      time_us: 1640995200000000,
      kind: "commit",
      commit: deleteCommit,
    };

    testHelper.eventManager.setMockEvent(mockEvent);
    testHelper.postRepository.setError(true);

    const input = {
      data: JSON.stringify(mockEvent),
    };

    const result = await processFirehose(input, context);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error.usecase).toBe("processFirehose");
      expect(result.error.message).toBe("Failed to delete post");
    }
  });

  it("should handle tag upsert error", async () => {
    const createCommit: CreatePostCommit = {
      rev: "rev-1",
      operation: "create",
      collection: "app.bsky.feed.post",
      rkey: rkeySchema.parse("rkey-1"),
      record: {
        $type: "app.bsky.feed.post",
        createdAt: "2024-01-01T00:00:00Z",
        text: "Hello world #tech",
      },
      cid: "cid-1",
    };

    const mockEvent: PostCommitEvent = {
      did: didSchema.parse("did:example:123"),
      time_us: 1640995200000000,
      kind: "commit",
      commit: createCommit,
    };

    testHelper.eventManager.setMockEvent(mockEvent);
    testHelper.eventManager.setMockRenderResult({
      text: "Hello world #tech",
      tags: ["tech"],
    });
    testHelper.postTagRepository.setError(true);

    const input = {
      data: JSON.stringify(mockEvent),
    };

    const result = await processFirehose(input, context);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error.usecase).toBe("processFirehose");
      expect(result.error.message).toBe("Failed to create post");
    }
  });
});
