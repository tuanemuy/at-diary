import type { Context } from "@/core/application/context.ts";
import {
  MockPostRepository,
  MockTagRepository,
  MockPostTagRepository,
  MockEventManager,
} from "@/core/adapters/mock/index.ts";

/**
 * Creates a test context with fresh mock adapters for testing application services.
 * This provides real-like behavior without the complexity of actual database setup.
 */
export function createTestContext(): Context & {
  cleanup: () => void;
} {
  const postRepository = new MockPostRepository();
  const tagRepository = new MockTagRepository();
  const postTagRepository = new MockPostTagRepository();
  const eventManager = new MockEventManager();

  // Clear all existing data
  postRepository.clearPosts();
  tagRepository.clearTags();
  postTagRepository.clearPostTags();

  const context: Context = {
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

  const cleanup = () => {
    // Clear all data for cleanup
    postRepository.clearPosts();
    tagRepository.clearTags();
    postTagRepository.clearPostTags();
  };

  return { ...context, cleanup };
}

/**
 * Helper to setup test data with proper relationships
 */
export interface TestDataHelper {
  postRepository: MockPostRepository;
  tagRepository: MockTagRepository;
  postTagRepository: MockPostTagRepository;
  eventManager: MockEventManager;
}

export function getTestDataHelper(context: Context): TestDataHelper {
  return {
    postRepository: context.deps.postRepository as MockPostRepository,
    tagRepository: context.deps.tagRepository as MockTagRepository,
    postTagRepository: context.deps.postTagRepository as MockPostTagRepository,
    eventManager: context.deps.eventManager as MockEventManager,
  };
}
