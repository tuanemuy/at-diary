import type { PostRepository } from "@/core/domain/post/port/postRepository.ts";
import type { PostTagRepository } from "@/core/domain/post/port/postTagRepository.ts";
import type { TagRepository } from "@/core/domain/post/port/tagRepository.ts";
import type { EventManager } from "@/core/domain/post/port/eventManager.ts";

export type Context = {
  config: {
    did: string;
    jetstreamHost: string;
  };
  deps: {
    postRepository: PostRepository;
    postTagRepository: PostTagRepository;
    tagRepository: TagRepository;
    eventManager: EventManager;
  };
};
