import { context } from "./context.ts";
import {
  type ListPostsInput,
  listPosts,
} from "@/core/application/post/listPosts.ts";
import {
  type ListPostsByTagNameInput,
  listPostsByTagName,
} from "@/core/application/post/listPostsByTagName.ts";
import { listTags } from "@/core/application/post/listTags.ts";
import {
  type ProcessFirehoseInput,
  processFirehose,
} from "@/core/application/post/processFirehose.ts";

export function listPostsAction(input: ListPostsInput) {
  return listPosts(input, context).unwrapOr({
    items: [],
    count: 0,
  });
}

export function listPostsByTagNameAction(input: ListPostsByTagNameInput) {
  return listPostsByTagName(input, context).unwrapOr({
    items: [],
    count: 0,
  });
}

export function listTagsAction() {
  return listTags(context).unwrapOr({ items: [] });
}

export function processFirehoseAction(input: ProcessFirehoseInput) {
  return processFirehose(input, context).unwrapOr(undefined);
}
