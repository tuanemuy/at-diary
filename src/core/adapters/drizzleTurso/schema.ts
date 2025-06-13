import { v7 as uuidv7 } from "uuid";
import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const posts = sqliteTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    did: text("did").notNull(),
    rkey: text("rkey").notNull(),
    text: text("text").notNull(),
    postedAt: integer("posted_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    nameIdx: uniqueIndex("rkey_idx").on(table.rkey),
  }),
);

export const postsRelations = relations(posts, ({ many }) => ({
  postTags: many(postTags),
}));

export const tags = sqliteTable(
  "tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text("name").notNull(),
  },
  (table) => ({
    nameIdx: uniqueIndex("name_idx").on(table.name),
  }),
);

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postTags = sqliteTable(
  "post_tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    postTagIdx: uniqueIndex("post_tag_idx").on(table.postId, table.tagId),
  }),
);

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));
