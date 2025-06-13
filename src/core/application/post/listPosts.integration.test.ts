import { describe, it, beforeEach, afterEach } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { listPosts } from "./listPosts.ts";
import type { Context } from "../context.ts";
import type { Post } from "@/core/domain/post/types.ts";
import {
  MockPostRepository,
  MockPostTagRepository,
  MockTagRepository,
  MockEventManager,
} from "@/core/adapters/mock/index.ts";
import { createTestPost } from "@/core/test/testDataFactory.ts";

describe("listPosts - Integration Test with Mock Adapters", () => {
  let postRepository: MockPostRepository;
  let tagRepository: MockTagRepository;
  let postTagRepository: MockPostTagRepository;
  let eventManager: MockEventManager;
  let context: Context;

  beforeEach(() => {
    // Create mock adapters for integration testing
    postRepository = new MockPostRepository();
    postRepository.clearPosts();
    tagRepository = new MockTagRepository();
    tagRepository.clearTags();
    postTagRepository = new MockPostTagRepository();
    postTagRepository.clearPostTags();
    eventManager = new MockEventManager();

    context = {
      config: {
        did: "test-did",
        jetstreamHost: "test-host",
      },
      deps: {
        postRepository,
        postTagRepository,
        tagRepository,
        eventManager,
      },
    };
  });

  afterEach(() => {
    // Clean up any resources if needed
  });

  it("should create and list posts with mock adapters", async () => {
    // Create test posts using mock repository
    const post1: Post = createTestPost({
      text: "First integration test post",
      postedAt: new Date("2024-01-01"),
    });

    const post2: Post = createTestPost({
      text: "Second integration test post with keyword",
      postedAt: new Date("2024-01-02"),
    });

    // Add posts to mock repository
    postRepository.addPost(post1);
    postRepository.addPost(post2);

    // Test default pagination
    const listResult = await listPosts({}, context);

    expect(listResult.isOk()).toBe(true);
    if (listResult.isOk()) {
      expect(listResult.value.items).toHaveLength(2);
      expect(listResult.value.count).toBe(2);
      expect(listResult.value.items[0].text).toBe(
        "First integration test post",
      );
      expect(listResult.value.items[1].text).toBe(
        "Second integration test post with keyword",
      );
    }

    // Test text filter
    const filterResult = await listPosts(
      {
        filter: { text: "keyword" },
      },
      context,
    );

    expect(filterResult.isOk()).toBe(true);
    if (filterResult.isOk()) {
      expect(filterResult.value.items).toHaveLength(1);
      expect(filterResult.value.items[0].text).toBe(
        "Second integration test post with keyword",
      );
    }

    // Test pagination
    const paginationResult = await listPosts(
      {
        pagination: {
          page: 1,
          limit: 1,
          order: "desc",
          orderBy: "postedAt",
        },
      },
      context,
    );

    expect(paginationResult.isOk()).toBe(true);
    if (paginationResult.isOk()) {
      expect(paginationResult.value.items).toHaveLength(1);
      expect(paginationResult.value.count).toBe(2);
    }
  });

  it("should handle empty repository", async () => {
    const result = await listPosts({}, context);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toHaveLength(0);
      expect(result.value.count).toBe(0);
    }
  });

  it("should handle repository errors gracefully", async () => {
    // Set repository to return error
    postRepository.setError(true);

    const result = await listPosts({}, context);

    expect(result.isErr()).toBe(true);
  });
});
