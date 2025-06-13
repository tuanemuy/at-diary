import type { Post } from "@/core/domain/post/types.ts";
import { format } from "date-fns";

import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

type Props = {
  post: Post;
};

export function PostItem({ post }: Props) {
  return (
    <Card className="p-6 rounded-xl">
      <div>
        {post.postedAt && (
          <p className="shrink-0 text-sm text-muted-foreground font-medium">
            {format(post.postedAt, "yyyy/MM/dd HH:mm")}
          </p>
        )}

        <div className="relative mt-2">
          <div
            dangerouslySetInnerHTML={{ __html: post.text }}
            className="article"
          />
        </div>
      </div>
    </Card>
  );
}

export function PostItemSkeleton() {
  return (
    <Card className="p-6 rounded-xl">
      <div>
        <div className="shrink-0 text-sm text-muted-foreground">
          <Skeleton className="w-24 h-4" />
        </div>

        <div className="relative mt-3">
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-full h-4" />
        </div>
      </div>
    </Card>
  );
}
