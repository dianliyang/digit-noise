import Link from "next/link";
import type { BlogPost } from "../../lib/blog";

export default function BlogPost({
  post,
  backHref,
  backLabel,
  updatedPrefix,
  lang,
}: {
  post: BlogPost;
  backHref: string;
  backLabel: string;
  updatedPrefix: string;
  lang: string;
}) {
  return (
    <div className="animate-slide-up" lang={lang}>
      <Link
        href={backHref}
        className="mb-12 flex items-center gap-2 text-sm font-medium uppercase tracking-widest decoration-2 underline-offset-4 hover:underline"
      >
        ← {backLabel}
      </Link>

      <article>
        <header className="mb-12">
          <time className="mb-4 block text-sm font-medium uppercase tracking-widest">
            {post.createdAt}
          </time>
          <h1 className="text-4xl font-medium leading-tight tracking-tighter md:text-5xl">
            {post.title}
          </h1>
        </header>

        <div
          className="prose prose-lg prose-p:leading-loose max-w-none md:prose-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 flex justify-end">
          <span className="text-sm text-gray-600">
            {updatedPrefix} {post.updatedAt}
          </span>
        </div>
      </article>
    </div>
  );
}
