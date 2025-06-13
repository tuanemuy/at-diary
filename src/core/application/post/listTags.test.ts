import { describe, it, beforeEach, afterEach } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { listTags } from "./listTags.ts";
import type { Context } from "../context.ts";
import type { Tag } from "@/core/domain/post/types.ts";
import { ApplicationError } from "../error.ts";
import {
  createTestContext,
  getTestDataHelper,
} from "@/core/test/testHelper.ts";
import { createTestTag } from "@/core/test/testDataFactory.ts";

describe("listTags with Mock Adapters", () => {
  let context: Context & { cleanup: () => void };
  let testHelper: ReturnType<typeof getTestDataHelper>;

  beforeEach(() => {
    context = createTestContext();
    testHelper = getTestDataHelper(context);
  });

  afterEach(() => {
    context.cleanup();
  });

  it("should return all tags", async () => {
    const mockTags: Tag[] = [
      createTestTag({ name: "tech" }),
      createTestTag({ name: "life" }),
      createTestTag({ name: "sports" }),
    ];

    for (const tag of mockTags) {
      testHelper.tagRepository.addTag(tag);
    }

    const result = await listTags(context);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toHaveLength(3);
      expect(result.value.items[0].name).toBe("tech");
      expect(result.value.items[1].name).toBe("life");
      expect(result.value.items[2].name).toBe("sports");
    }
  });

  it("should return empty list when no tags exist", async () => {
    const result = await listTags(context);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toHaveLength(0);
    }
  });

  it("should handle repository error", async () => {
    testHelper.tagRepository.setError(true);

    const result = await listTags(context);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ApplicationError);
      expect(result.error.usecase).toBe("listTags");
      expect(result.error.message).toBe("Failed to list tags");
    }
  });

  it("should preserve tag order from repository", async () => {
    const mockTags: Tag[] = [
      createTestTag({ name: "zebra" }),
      createTestTag({ name: "apple" }),
      createTestTag({ name: "monkey" }),
    ];

    for (const tag of mockTags) {
      testHelper.tagRepository.addTag(tag);
    }

    const result = await listTags(context);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toHaveLength(3);
      expect(result.value.items[0].name).toBe("zebra");
      expect(result.value.items[1].name).toBe("apple");
      expect(result.value.items[2].name).toBe("monkey");
    }
  });
});
