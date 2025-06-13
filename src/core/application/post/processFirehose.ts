import { z } from "zod/v4";
import { type ResultAsync, okAsync, errAsync } from "neverthrow";
import { parseJson } from "@/lib/json.ts";
import { validate } from "@/lib/validation.ts";
import { isCreatePostCommit } from "@/core/domain/post/types.ts";
import { ApplicationError } from "../error.ts";
import type { Context } from "../context.ts";

export const processFirehoseInputSchema = z.object({
  data: z.string(),
});
export type ProcessFirehoseInput = z.infer<typeof processFirehoseInputSchema>;

export function processFirehose(
  input: z.infer<typeof processFirehoseInputSchema>,
  context: Context,
): ResultAsync<void, ApplicationError> {
  const { eventManager, postRepository, postTagRepository } = context.deps;

  console.info("Processing firehose input:", input);

  const eventResult = validate(processFirehoseInputSchema, input)
    .andThen((input) => parseJson(input.data))
    .andThen((json) => eventManager.parseEvent(json))
    .orTee((error) => console.error("Error parsing event:", error));

  if (eventResult.isErr()) {
    return errAsync(
      new ApplicationError(
        "processFirehose",
        "Failed to parse event",
        eventResult.error,
      ),
    );
  }

  const event = eventResult.value;
  const commit = event.commit;

  if (isCreatePostCommit(commit)) {
    return eventManager
      .renderPost(commit)
      .andThen(({ text, tags }) =>
        postRepository
          .create({
            did: event.did,
            rkey: event.commit.rkey,
            text,
            postedAt: new Date(commit.record.createdAt),
          })
          .map((post) => ({ post, tags })),
      )
      .andThen(({ post, tags }) =>
        tags.length > 0
          ? postTagRepository
              .upsertMany({ postId: post.id, names: tags })
              .map(() => post)
          : okAsync(post),
      )
      .map(() => undefined)
      .mapErr(
        (error) =>
          new ApplicationError(
            "processFirehose",
            "Failed to create post",
            error,
          ),
      )
      .andTee((post) => console.info("Created post:", post))
      .orTee((error) => console.error("Error creating post:", error));
  }

  if (event.commit.operation === "delete") {
    return postRepository
      .deleteByDid(event.did)
      .mapErr(
        (error) =>
          new ApplicationError(
            "processFirehose",
            "Failed to delete post",
            error,
          ),
      )
      .andTee(() => console.info("Deleted post for did:", event.did))
      .orTee((error) => console.error("Error deleting post:", error));
  }

  return errAsync(new ApplicationError("processFirehose", "Unreachable"));
}
