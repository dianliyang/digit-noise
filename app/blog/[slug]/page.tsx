import Link from "next/link";
import { getBlogPost, getBlogSlugs } from "../../lib/blog";

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  return (
    <div className="animate-slide-up">
      <Link
        href="/blog"
        className="mb-12 flex items-center gap-2 text-sm font-medium uppercase tracking-widest decoration-2 underline-offset-4 hover:underline"
      >
        ← Back to Blog
      </Link>

      <article>
        <header className="mb-12">
          <time className="mb-4 block text-sm font-medium uppercase tracking-widest">
            {post.date}
          </time>
          <h1 className="text-4xl font-medium leading-tight tracking-tighter md:text-5xl">
            {post.title}
          </h1>
        </header>

        <div
          className="prose prose-lg prose-p:leading-loose max-w-none md:prose-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
