import Link from "next/link";
import { getAllBlogPosts } from "../lib/blog";

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="animate-fade-in">
      <h2 className="mb-12 text-2xl font-medium tracking-tight">Writing</h2>
      <div className="flex flex-col gap-12">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`} className="block">
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
