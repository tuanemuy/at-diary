import { describe, it, beforeEach, afterEach } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { listPostsByTag } from "./listPostsByTag.ts";
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

describe("listPostsByTag with Mock Adapters", () => {
  let context: Context & { cleanup: () => void };
  let testHelper: ReturnType<typeof getTestDataHelper>;

  beforeEach(() => {
    context = createTestContext();
    testHelper = getTestDataHelper(context);
  });

  afterEach(() => {
    context.cleanup();
  });

  it("should return posts for given tag with default pagination", async () => {
    const mockPosts: Post[] = [
      createTestPost({
        text: "First post #tech",
        postedAt: new Date("2024-01-01"),
      }),
      createTestPost({
        text: "Second post #life",
        postedAt: new Date("2024-01-02"),
      }),
      createTestPost({
        text: "Third post #tech",
        postedAt: new Date("2024-01-03"),
      }),
    ];

    for (const post of mockPosts) {
      testHelper.postRepository.addPost(post);
    }

    const result = await listPostsByTag({ tagId: "tech" }, context);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toHaveLength(2);
      expect(result.value.count).toBe(2);
      expect(result.value.items[0].text).toContain("#tech");
      expect(result.value.items[1].text).toContain("#tech");
    }
  });

  it("should apply custom pagination", async () => {
    const mockPosts: Post[] = createTestPosts(15, { text: "Post with #tech" });

    for (const post of mockPosts) {
      testHelper.postRepository.addPost(post);
    }

    const result = await listPostsByTag(
      {
        tagId: "tech",
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

  it("should return empty result for non-existent tag", async () => {
    const mockPosts: Post[] = [
      createTestPost({
        text: "First post #tech",
        postedAt: new Date("2024-01-01"),
      }),
    ];

    for (const post of mockPosts) {
      testHelper.postRepository.addPost(post);
    }

    const result = await listPostsByTag({ tagId: "nonexistent" }, context);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toHaveLength(0);
      expect(result.value.count).toBe(0);
    }
  });

  it("should handle repository error", async () => {
    testHelper.postRepository.setError(true);

    const result = await listPostsByTag({ tagId: "tech" }, context);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error.usecase).toBe("listPostsByTag");
      expect(result.error.message).toBe("Failed to list posts");
    }
  });

  it("should handle invalid input - empty tagId", async () => {
    const result = await listPostsByTag({ tagId: "" }, context);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
    }
  });

  it("should handle invalid input - missing tagId", async () => {
    const result = await listPostsByTag({} as { tagId: string }, context);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
    }
  });
});
