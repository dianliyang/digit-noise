import BlogIndex from "../../components/blog/BlogIndex";
import { getAllBlogPosts } from "../../lib/blog";

export default function ZhBlogPage() {
  const posts = getAllBlogPosts("zh");

  return <BlogIndex posts={posts} heading="写作" basePath="/zh/blog" locale="zh" lang="zh-Hans" />;
}
