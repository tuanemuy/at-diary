import { z } from "zod/v4";
import type { ResultAsync } from "neverthrow";
import { paginationSchema } from "@/lib/pagination.ts";
import { validate } from "@/lib/validation.ts";
import type { Post } from "@/core/domain/post/types.ts";
import { ApplicationError } from "../error.ts";
import type { Context } from "../context.ts";

export const listPostsInputSchema = z.object({
  pagination: paginationSchema.optional(),
  filter: z
    .object({
      text: z.string().optional(),
    })
    .optional(),
});
export type ListPostsInput = z.infer<typeof listPostsInputSchema>;

export function listPosts(
  input: z.infer<typeof listPostsInputSchema>,
  context: Context,
): ResultAsync<{ items: Post[]; count: number }, ApplicationError> {
  const { postRepository } = context.deps;

  return validate(listPostsInputSchema, input)
    .map((input) => {
      const pagination = input.pagination ?? {
        page: 1,
        limit: 10,
        order: "desc",
        orderBy: "postedAt",
      };
      return { pagination, filter: input.filter };
    })
    .asyncAndThen((query) => postRepository.list(query))
    .mapErr(
      (error) =>
        new ApplicationError("listPosts", "Failed to list posts", error),
    );
}
