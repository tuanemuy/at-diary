import { listTagsAction } from "@/actions/post.ts";

export const revalidate = 300;

export const generateStaticParams = async () => {
  const { items } = await listTagsAction();
  return items.map((tag) => ({
    tagName: tag.name,
  }));
};

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <>{children}</>;
}
