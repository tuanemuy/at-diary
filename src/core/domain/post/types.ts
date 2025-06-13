import { z } from "zod/v4";
import { paginationSchema } from "@/lib/pagination.ts";

export const postIdSchema = z.uuid().brand("postId");
export type PostId = z.infer<typeof postIdSchema>;

export const didSchema = z.string().brand("did");
export type DID = z.infer<typeof didSchema>;

export const rkeySchema = z.string().brand("rkey");
export type RKey = z.infer<typeof rkeySchema>;

export const postSchema = z.object({
  id: postIdSchema,
  did: didSchema,
  rkey: rkeySchema,
  text: z.string(),
  postedAt: z.date(),
});
export type Post = z.infer<typeof postSchema>;

export const createPostParamsSchema = z.object({
  did: z.string().min(1),
  rkey: z.string().min(1),
  text: z.string(),
  postedAt: z.date(),
});
export type CreatePostParams = z.infer<typeof createPostParamsSchema>;

export const listPostQuerySchema = z.object({
  pagination: paginationSchema,
  filter: z
    .object({
      text: z.string().optional(),
    })
    .optional(),
});
export type ListPostQuery = z.infer<typeof listPostQuerySchema>;

export const listPostByTagQuerySchema = z.object({
  pagination: paginationSchema,
  tagId: z.string().min(1),
});
export type ListPostByTagQuery = z.infer<typeof listPostByTagQuerySchema>;

export const tagIdSchema = z.string().brand("tagId");
export type TagId = z.infer<typeof tagIdSchema>;

export const tagSchema = z.object({
  id: tagIdSchema,
  name: z.string().min(1),
});
export type Tag = z.infer<typeof tagSchema>;

export const postTagIdSchema = z.string().brand("postTagId");
export type PostTagId = z.infer<typeof postTagIdSchema>;

export const postTagSchema = z.object({
  id: postTagIdSchema,
  postId: postIdSchema,
  tag: tagSchema,
});
export type PostTag = z.infer<typeof postTagSchema>;

export const upsertPostTagParamsSchema = z.object({
  postId: postIdSchema,
  names: z.array(z.string().min(1)),
});
export type UpsertPostTagParams = z.infer<typeof upsertPostTagParamsSchema>;

export const blobRefSchema = z.object({
  $type: z.literal("blob"),
  ref: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export const unknownTypeSchema = z.object({
  $type: z.string().min(1),
});

export const imageSchema = z.object({
  alt: z.string(),
  aspectRatio: z
    .object({
      height: z.number(),
      width: z.number(),
    })
    .optional(),
  image: blobRefSchema,
});
export const imagesSchema = z.object({
  $type: z.literal("app.bsky.embed.images"),
  images: z.array(imageSchema),
});
export type EmbededImages = z.infer<typeof imagesSchema>;

export const videoSchema = z.object({
  $type: z.literal("app.bsky.embed.video"),
  video: z.object({
    alt: z.string().optional(),
    captions: z
      .array(
        z.object({
          lang: z.string(),
          file: blobRefSchema,
        }),
      )
      .optional(),
    aspectRatio: z
      .object({
        height: z.number(),
        width: z.number(),
      })
      .optional(),
    video: blobRefSchema,
  }),
});
export type EmbededVideo = z.infer<typeof videoSchema>;

export const externalSchema = z.object({
  $type: z.literal("app.bsky.embed.external"),
  external: z.object({
    uri: z.string(),
    title: z.string(),
    description: z.string(),
    thumb: blobRefSchema.optional(),
  }),
});
export type EmbededExternal = z.infer<typeof externalSchema>;

export const recordSchema = z.object({
  $type: z.literal("app.bsky.embed.record"),
  record: z.any(),
});

export const recordWithMediaSchema = z.object({
  $type: z.literal("app.bsky.embed.recordWithMedia"),
  record: z.any(),
  media: z.union([
    imagesSchema,
    videoSchema,
    externalSchema,
    unknownTypeSchema,
  ]),
});

export const embedSchema = z.union([
  imagesSchema,
  videoSchema,
  externalSchema,
  recordSchema,
  recordWithMediaSchema,
  unknownTypeSchema,
]);
export type Embed = z.infer<typeof embedSchema>;

export const mentionSchema = z.object({
  $type: z.literal("app.bsky.richtext.facet#mention"),
  did: z.string().min(1),
});

export const linkSchema = z.object({
  $type: z.literal("app.bsky.richtext.facet#link"),
  uri: z.string().min(1),
});

export const hashtagSchema = z.object({
  $type: z.literal("app.bsky.richtext.facet#tag"),
  tag: z.string().min(1),
});

export const facetSchema = z.object({
  features: z.array(
    z.union([mentionSchema, linkSchema, hashtagSchema, unknownTypeSchema]),
  ),
  index: z.object({
    byteEnd: z.number(),
    byteStart: z.number(),
  }),
});

export const postRecordSchema = z.object({
  $type: z.literal("app.bsky.feed.post"),
  createdAt: z.iso.datetime({ offset: true }),
  embed: embedSchema.optional(),
  facets: z.array(facetSchema).optional(),
  langs: z.array(z.string().min(1)).optional(),
  text: z.string().min(1),
});
export type PostRecord = z.infer<typeof postRecordSchema>;

export const createPostCommitSchema = z.object({
  rev: z.string().min(1),
  operation: z.literal("create"),
  collection: z.literal("app.bsky.feed.post"),
  rkey: rkeySchema,
  record: postRecordSchema,
  cid: z.string().min(1),
});
export type CreatePostCommit = z.infer<typeof createPostCommitSchema>;

export const deletePostCommitSchema = z.object({
  rev: z.string().min(1),
  operation: z.literal("delete"),
  collection: z.literal("app.bsky.feed.post"),
  rkey: rkeySchema,
});
export type DeletePostCommit = z.infer<typeof deletePostCommitSchema>;

export const postCommitEventSchema = z.object({
  did: didSchema,
  time_us: z.number(),
  kind: z.literal("commit"),
  commit: z.discriminatedUnion("operation", [
    createPostCommitSchema,
    deletePostCommitSchema,
  ]),
});
export type PostCommitEvent = z.infer<typeof postCommitEventSchema>;

export function isCreatePostCommit(
  commit: CreatePostCommit | DeletePostCommit,
): commit is CreatePostCommit {
  return commit.operation === "create";
}
