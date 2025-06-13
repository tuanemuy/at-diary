import type { Tag } from "@/core/domain/post/types.ts";

import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

type Props = {
  tag: Tag;
};

export function TagItem({ tag }: Props) {
  return (
    <Button className="rounded-full" asChild>
      <a href={`/tag/${tag.name}`}>#{tag.name}</a>
    </Button>
  );
}

export function TagItemSkeleton() {
  return (
    <Button
      variant="outline"
      className="rounded-full bg-card border-none shadow-md"
    >
      #<Skeleton className="w-16 h-4" />
    </Button>
  );
}
