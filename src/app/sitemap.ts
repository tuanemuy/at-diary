export const revalidate = 3600;

import type { MetadataRoute } from "next";
import { listTagsAction } from "@/actions/post.ts";
import { publicUrl } from "@/config.ts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { items } = await listTagsAction();

  return [
    {
      url: `${publicUrl}/`,
      changeFrequency: "daily",
    },
    ...items.map((tag) => ({
      url: `${publicUrl}/tag/${encodeURIComponent(tag.name)}`,
      changeFrequency: "weekly" as const,
    })),
  ];
}
