import { z } from "zod/v4";
import { getDatabase } from "@/core/adapters/drizzleTurso/client.ts";
import { DrizzleTursoPostRepository } from "@/core/adapters/drizzleTurso/post/postRepository.ts";
import { DrizzleTursoPostTagRepository } from "@/core/adapters/drizzleTurso/post/postTagRepository.ts";
import { DrizzleTursoTagRepository } from "@/core/adapters/drizzleTurso/post/tagRepository.ts";
import { BlueskyEventManager } from "@/core/adapters/bluesky/eventManager.ts";

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string(),
  TURSO_DATABASE_AUTH_TOKEN: z.string(),
  DID: z.string(),
  JETSTREAM_HOST: z.string(),
});
export type Env = z.infer<typeof envSchema>;

const env = envSchema.safeParse(Deno.env.toObject());
if (!env.success) {
  throw new Error(env.error.message);
}

export const database = getDatabase(
  env.data.TURSO_DATABASE_URL,
  env.data.TURSO_DATABASE_AUTH_TOKEN,
);

const postRepository = new DrizzleTursoPostRepository(database);
const postTagRepository = new DrizzleTursoPostTagRepository(database);
const tagRepository = new DrizzleTursoTagRepository(database);
const eventManager = new BlueskyEventManager();

export const context = {
  config: {
    did: env.data.DID,
    jetstreamHost: env.data.JETSTREAM_HOST,
  },
  deps: {
    postRepository,
    postTagRepository,
    tagRepository,
    eventManager,
  },
};
