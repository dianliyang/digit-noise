import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

marked.use({ async: false });

export type BlogPost = {
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  excerpt: string;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getBlogSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf-8");
      const { data } = matter(raw);
      return slugify(String(data.title ?? ""));
    });
}

export function getBlogPost(slug: string): BlogPost {
  if (/[/.]/.test(slug)) {
    throw new Error(`Invalid slug: "${slug}"`);
  }
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  for (const f of files) {
    const filePath = path.join(BLOG_DIR, f);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    if (slugify(String(data.title ?? "")) !== slug) continue;
    if (!data.title || !data.excerpt) {
      throw new Error(`Blog post "${slug}" is missing required frontmatter fields`);
    }
    const { birthtime, mtime } = fs.statSync(filePath);
    return {
      slug,
      title: String(data.title),
      createdAt: birthtime.toISOString().split("T")[0],
      updatedAt: data.updatedAt
        ? data.updatedAt instanceof Date
          ? data.updatedAt.toISOString().split("T")[0]
          : String(data.updatedAt)
        : mtime.toISOString().split("T")[0],
      excerpt: String(data.excerpt),
      content: String(marked.parse(content)),
    };
  }
  throw new Error(`No post found for slug: "${slug}"`);
}

export function getAllBlogPosts(): BlogPost[] {
  return getBlogSlugs()
    .map(getBlogPost)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
