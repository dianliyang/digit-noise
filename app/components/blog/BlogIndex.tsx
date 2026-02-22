import Link from "next/link";
import type { BlogLocale, BlogPost } from "../../lib/blog";
import BlogLanguageSwitch from "./BlogLanguageSwitch";

export default function BlogIndex({
  posts,
  heading,
  basePath,
  locale,
  lang,
}: {
  posts: BlogPost[];
  heading: string;
  basePath: string;
  locale: BlogLocale;
  lang: string;
}) {
  return (
    <div className="animate-fade-in" lang={lang}>
      <h2 className="mb-12 text-2xl font-medium tracking-tight">{heading}</h2>
      <BlogLanguageSwitch locale={locale} />
      <div className="flex flex-col gap-12">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`${basePath}/${post.slug}`} className="block">
              <time className="mb-3 block text-sm font-medium uppercase tracking-widest">
                {post.createdAt}
              </time>
              <h3 className="mb-3 text-2xl font-medium leading-snug tracking-tight decoration-2 underline-offset-4 group-hover:underline md:text-3xl">
                {post.title}
              </h3>
              <p className="max-w-2xl text-lg leading-relaxed">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
