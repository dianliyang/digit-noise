import BlogIndex from "../components/blog/BlogIndex";
import { getAllBlogPosts } from "../lib/blog";

export default function BlogPage() {
  const posts = getAllBlogPosts("en");

  return <BlogIndex posts={posts} heading="Writing" basePath="/blog" locale="en" lang="en" />;
}
