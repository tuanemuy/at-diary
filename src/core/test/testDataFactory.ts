import {
  type Post,
  type Tag,
  type PostTag,
  type CreatePostParams,
  postIdSchema,
  didSchema,
  rkeySchema,
  tagIdSchema,
  postTagIdSchema,
} from "@/core/domain/post/types.ts";

function generateUUID(): string {
  return crypto.randomUUID();
}

export function createTestPost(overrides: Partial<Post> = {}): Post {
  const defaults: Post = {
    id: postIdSchema.parse(generateUUID()),
    did: didSchema.parse("did:example:test"),
    rkey: rkeySchema.parse(`rkey-${Date.now()}`),
    text: "Test post content",
    postedAt: new Date(),
  };

  return { ...defaults, ...overrides };
}

export function createTestTag(overrides: Partial<Tag> = {}): Tag {
  const defaults: Tag = {
    id: tagIdSchema.parse(generateUUID()),
    name: "test-tag",
  };

  return { ...defaults, ...overrides };
}

export function createTestPostTag(overrides: Partial<PostTag> = {}): PostTag {
  const defaults: PostTag = {
    id: postTagIdSchema.parse(generateUUID()),
    postId: postIdSchema.parse(generateUUID()),
    tag: createTestTag(),
  };

  return { ...defaults, ...overrides };
}

export function createTestCreatePostParams(
  overrides: Partial<CreatePostParams> = {},
): CreatePostParams {
  const defaults: CreatePostParams = {
    did: "did:example:test",
    rkey: `rkey-${Date.now()}`,
    text: "Test post content",
    postedAt: new Date(),
  };

  return { ...defaults, ...overrides };
}

export function createTestPosts(
  count: number,
  baseOverrides: Partial<Post> = {},
): Post[] {
  return Array.from({ length: count }, (_, i) =>
    createTestPost({
      ...baseOverrides,
      text: baseOverrides.text || `Test post ${i + 1}`,
      postedAt: new Date(`2024-01-${String(i + 1).padStart(2, "0")}`),
    }),
  );
}

export function createTestTags(
  count: number,
  baseOverrides: Partial<Tag> = {},
): Tag[] {
  return Array.from({ length: count }, (_, i) =>
    createTestTag({
      ...baseOverrides,
      name: baseOverrides.name || `tag-${i + 1}`,
    }),
  );
}
