import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

marked.use({ async: false });

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export function getBlogSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getBlogPost(slug: string): BlogPost {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    content: String(marked.parse(content)),
  };
}

export function getAllBlogPosts(): BlogPost[] {
  return getBlogSlugs().map(getBlogPost);
}
