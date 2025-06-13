import { describe, it, beforeEach, afterEach } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { listPosts } from "./listPosts.ts";
import type { Context } from "../context.ts";
import type { Post } from "@/core/domain/post/types.ts";
import { ApplicationError } from "../error.ts";
import {
  createTestContext,
  getTestDataHelper,
} from "@/core/test/testHelper.ts";
import {
  createTestPost,
  createTestPosts,
} from "@/core/test/testDataFactory.ts";

describe("listPosts with Mock Adapters", () => {
  let context: Context & { cleanup: () => void };
  let testHelper: ReturnType<typeof getTestDataHelper>;

  beforeEach(() => {
    context = createTestContext();
    testHelper = getTestDataHelper(context);
  });

  afterEach(() => {
    context.cleanup();
  });

  it("should return posts with default pagination", async () => {
    const mockPosts: Post[] = [
      createTestPost({
        text: "First post",
        postedAt: new Date("2024-01-01"),
      }),
      createTestPost({
        text: "Second post",
        postedAt: new Date("2024-01-02"),
      }),
    ];

    for (const post of mockPosts) {
      testHelper.postRepository.addPost(post);
    }

    const result = await listPosts({}, context);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toHaveLength(2);
      expect(result.value.count).toBe(2);
      expect(result.value.items[0].text).toBe("First post");
    }
  });

  it("should apply text filter", async () => {
    const mockPosts: Post[] = [
      createTestPost({
        text: "Hello world",
        postedAt: new Date("2024-01-01"),
      }),
      createTestPost({
        text: "Goodbye moon",
        postedAt: new Date("2024-01-02"),
      }),
    ];

    for (const post of mockPosts) {
      testHelper.postRepository.addPost(post);
    }

    const result = await listPosts(
      {
        filter: { text: "world" },
      },
      context,
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0].text).toBe("Hello world");
    }
  });

  it("should apply custom pagination", async () => {
    const mockPosts: Post[] = createTestPosts(15);

    for (const post of mockPosts) {
      testHelper.postRepository.addPost(post);
    }

    const result = await listPosts(
      {
        pagination: {
          page: 2,
          limit: 5,
          order: "desc",
          orderBy: "postedAt",
        },
      },
      context,
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toHaveLength(5);
      expect(result.value.count).toBe(15);
    }
  });

  it("should handle repository error", async () => {
    testHelper.postRepository.setError(true);

    const result = await listPosts({}, context);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error.usecase).toBe("listPosts");
      expect(result.error.message).toBe("Failed to list posts");
    }
  });

  it("should handle invalid input", async () => {
    const result = await listPosts(
      {
        pagination: {
          page: -1,
          limit: 0,
          order: "invalid" as "asc" | "desc",
          orderBy: "postedAt",
        },
      },
      context,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
    }
  });
});
