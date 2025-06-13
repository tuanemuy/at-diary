import { z } from "zod/v4";
import type { ResultAsync } from "neverthrow";
import { paginationSchema } from "@/lib/pagination.ts";
import { validate } from "@/lib/validation.ts";
import type { Post } from "@/core/domain/post/types.ts";
import { ApplicationError } from "../error.ts";
import type { Context } from "../context.ts";

export const listPostsByTagInputSchema = z.object({
  pagination: paginationSchema.optional(),
  tagId: z.string().min(1),
});
export type ListPostsByTagInput = z.infer<typeof listPostsByTagInputSchema>;

export function listPostsByTag(
  input: z.infer<typeof listPostsByTagInputSchema>,
  context: Context,
): ResultAsync<{ items: Post[]; count: number }, ApplicationError> {
  const { postRepository } = context.deps;

  return validate(listPostsByTagInputSchema, input)
    .map((input) => {
      const pagination = input.pagination ?? {
        page: 1,
        limit: 10,
        order: "desc",
        orderBy: "postedAt",
      };
      return { pagination, tagId: input.tagId };
    })
    .asyncAndThen((query) => postRepository.listByTag(query))
    .mapErr(
      (error) =>
        new ApplicationError("listPostsByTag", "Failed to list posts", error),
    );
}
