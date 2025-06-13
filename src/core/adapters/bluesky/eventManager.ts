import { ResultAsync, okAsync, errAsync } from "neverthrow";
import * as ATProto from "@atproto/api";
import { validate } from "@/lib/validation.ts";
import { nl2br } from "@/lib/utils.ts";
import type { JsonObject } from "@/lib/json.ts";
import type { EventManager } from "@/core/domain/post/port/eventManager.ts";
import { EventManagerError } from "@/core/domain/errors/eventManagerError.ts";
import {
  type CreatePostCommit,
  postCommitEventSchema,
} from "@/core/domain/post/types.ts";

export class BlueskyEventManager implements EventManager {
  parseEvent(jsonObject: JsonObject) {
    return validate(postCommitEventSchema, jsonObject).mapErr(
      (error) => new EventManagerError("Invalid post event", error),
    );
  }

  renderPost(commit: CreatePostCommit) {
    let text = "";

    const richtext = new ATProto.RichText({
      text: commit.record.text,
      facets: commit.record.facets,
    });
    for (const segment of richtext.segments()) {
      if (segment.isLink()) {
        text += `<a href="${segment.link?.uri}" target="_blank">${segment.text}</a>`;
      } else if (segment.isMention()) {
        text += `<a class="hashtag" href="https://bsky.app/profile/${segment.mention?.did}" target="_blank">${segment.text}</a>`;
      } else if (segment.isTag()) {
        text += `<a class="hashtag" href="/tag/${segment.tag?.tag}">${segment.text}</a>`;
      } else {
        text += segment.text;
      }
    }

    const tags =
      commit.record.facets?.flatMap((facet) =>
        facet.features
          .filter((feature) => ATProto.AppBskyRichtextFacet.isTag(feature))
          .map((tagFeature) => tagFeature.tag),
      ) || [];

    return okAsync(text).andThen((text) =>
      getPostThread(commit.rkey)
        .map((postView) => ({ text, postView }))
        .map(({ text, postView }) => {
          let result = `<p>${nl2br(text)}</p>`;
          const embed = postView?.embed;

          if (ATProto.AppBskyEmbedImages.isView(embed)) {
            for (const image of embed.images) {
              result += `<div><img src="${image.thumb}" alt="${image.alt}" /></div>`;
            }
          }
          if (ATProto.AppBskyEmbedVideo.isView(embed)) {
            result += `<div><video src="${embed.playlist}" alt="${embed.alt}" controls /></div>`;
          }
          if (ATProto.AppBskyEmbedExternal.isView(embed)) {
            if (embed.external.thumb) {
              result += `<div><a href="${embed.external.uri}" target="_blank"><img src="${embed.external.thumb}"></a></div>`;
            }
          }

          return {
            text: result,
            tags,
          };
        }),
    );
  }
}

function getPostThread(rkey: string) {
  const agent = new ATProto.Agent("https://public.api.bsky.app");
  const uri = `at://${Deno.env.get("DID")}/app.bsky.feed.post/${rkey}`;

  return ResultAsync.fromPromise(
    agent.getPostThread({
      uri,
      depth: 0,
    }),
    (error) => new EventManagerError("Failed to get post thread", error),
  ).andThen(({ data }) => {
    if (ATProto.AppBskyFeedDefs.isThreadViewPost(data.thread)) {
      return okAsync(data.thread.post);
    }
    return errAsync(
      new EventManagerError("Invalid thread view post", data.thread),
    );
  });
}
