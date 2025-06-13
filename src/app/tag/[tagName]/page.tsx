import { SearchParams, type RawSearchParams } from "@/lib/router.ts";
import { listPostsByTagNameAction } from "@/actions/post.ts";
import { siteName, perPage } from "@/config.ts";

import { Suspense } from "react";
import { Link } from "@/deps.ts";
import { Button } from "@/components/ui/button.tsx";
import { Pagination } from "@/components/navigation/Pagination.tsx";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.tsx";
import { PageHeader } from "@/components/layout/PageHeader.tsx";
import { Profile } from "@/components/profile/Profile.tsx";
import { PostItem, PostItemSkeleton } from "@/components/post/PostItem.tsx";
import { Toggle } from "@/components/theme/Toggle.tsx";
import { ChevronLeft } from "lucide-react";
import { Info } from "lucide-react";

type Props = {
  params: Promise<{ tagName: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagName: string }>;
}) {
  const p = await params;
  const tagName = decodeURIComponent(p.tagName);
  return {
    title: `#${tagName} | ${siteName}`,
    description: `Posts tagged with #${tagName} on Bluesky.`,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const p = await params;
  const tagName = decodeURIComponent(p.tagName);
  const sp = SearchParams.fromRaw(await searchParams);
  const page = Number.parseInt(sp.getOne("page") || "1", 10);

  return (
    <>
      <header>
        <PageHeader
          leading={
            <Button variant="default" asChild className="cursor-pointer">
              <Link href="/">
                <ChevronLeft />
                Home
              </Link>
            </Button>
          }
          trailing={<Toggle />}
        />

        <div className="content mt-4">
          <Profile />
        </div>
      </header>

      <main className="content pt-8 pb-12">
        <h1 className="text-2xl font-bold text-left">#{tagName}</h1>

        <div className="mt-4">
          <Suspense fallback={<PostListSkeleton />}>
            <PostList page={page} tagName={tagName} />
          </Suspense>
        </div>
      </main>
    </>
  );
}

type PostListProps = {
  page: number;
  tagName: string;
};

async function PostList({ page, tagName }: PostListProps) {
  const { items, count } = await listPostsByTagNameAction({
    tagName,
    pagination: {
      order: "desc",
      orderBy: "postedAt",
      limit: perPage,
      page,
    },
  });
  const totalPages = Math.ceil(count / perPage);

  return (
    <>
      {items.length > 0 && (
        <ul className="flex flex-col">
          {items.map((post) => (
            <li key={post.id} className="not-first:mt-4">
              <PostItem post={post} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination totalPages={totalPages} />
        </div>
      )}

      {items.length === 0 && (
        <Alert>
          <Info />
          <AlertTitle>There are no posts yet.</AlertTitle>
          <AlertDescription>Let's post something on Bluesky!</AlertDescription>
        </Alert>
      )}
    </>
  );
}

function PostListSkeleton() {
  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {Array.from({ length: 5 }, (_, i) => i).map((i) => (
        <PostItemSkeleton key={i} />
      ))}
    </div>
  );
}
