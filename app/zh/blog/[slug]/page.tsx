import { notFound } from "next/navigation";
import BlogPost from "../../../components/blog/BlogPost";
import { getBlogPost, getBlogSlugs } from "../../../lib/blog";

export function generateStaticParams() {
  return getBlogSlugs("zh").map((slug) => ({ slug }));
}

export default async function ZhBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = getBlogPost(slug, "zh");
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("No post found for slug:")) {
      notFound();
    }
    throw error;
  }

  return (
    <BlogPost
      post={post}
      backHref="/zh/blog"
      backLabel="返回博客"
      updatedPrefix="更新于"
      lang="zh-Hans"
    />
  );
}
