import { v7 as uuidv7 } from "uuid";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const posts = pgTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    did: text("did").notNull(),
    rkey: text("rkey").notNull(),
    text: text("text").notNull(),
    postedAt: timestamp("posted_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    nameIdx: uniqueIndex("rkey_idx").on(table.rkey),
  }),
);

export const postsRelations = relations(posts, ({ many }) => ({
  postTags: many(postTags),
}));

export const tags = pgTable(
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

export const postTags = pgTable(
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
