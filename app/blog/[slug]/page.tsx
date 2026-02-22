import BlogPost from "../../components/blog/BlogPost";
import { getBlogPost, getBlogSlugs } from "../../lib/blog";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getBlogSlugs("en").map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug, "en");

  return (
    <BlogPost
      post={post}
      backHref="/blog"
      backLabel="Back to Blog"
      updatedPrefix="Updated"
      lang="en"
    />
  );
}
