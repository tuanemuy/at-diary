import { z } from "zod/v4";
import type { ResultAsync } from "neverthrow";
import { paginationSchema } from "@/lib/pagination.ts";
import { validate } from "@/lib/validation.ts";
import type { Post } from "@/core/domain/post/types.ts";
import { ApplicationError } from "../error.ts";
import type { Context } from "../context.ts";

export const listPostsByTagNameInputSchema = z.object({
  pagination: paginationSchema.optional(),
  tagName: z.string().min(1),
});
export type ListPostsByTagNameInput = z.infer<
  typeof listPostsByTagNameInputSchema
>;

export function listPostsByTagName(
  input: z.infer<typeof listPostsByTagNameInputSchema>,
  context: Context,
): ResultAsync<{ items: Post[]; count: number }, ApplicationError> {
  const { postRepository, tagRepository } = context.deps;

  return validate(listPostsByTagNameInputSchema, input)
    .map((input) => {
      const pagination = input.pagination ?? {
        page: 1,
        limit: 10,
        order: "desc",
        orderBy: "postedAt",
      };
      return { pagination, tagName: input.tagName };
    })
    .asyncAndThen(({ pagination, tagName }) =>
      tagRepository.getByName(tagName).map((tag) => ({
        tagName,
        tag,
        pagination,
      })),
    )
    .andThen(({ tagName, tag, pagination }) => {
      if (!tag) {
        return postRepository.list({
          pagination,
          filter: { text: `#${tagName}` },
        });
      }
      return postRepository.listByTag({
        pagination,
        tagId: tag.id,
      });
    })
    .mapErr(
      (error) =>
        new ApplicationError(
          "listPostsByTagName",
          "Failed to list posts by tag name",
          error,
        ),
    );
}
