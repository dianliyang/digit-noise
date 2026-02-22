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

export type BlogLocale = "en" | "zh";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function getBlogDir(locale: BlogLocale): string {
  return path.join(BLOG_DIR, locale);
}

function readMarkdownFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function getBlogFiles(locale: BlogLocale): { dir: string; file: string }[] {
  const localeDir = getBlogDir(locale);
  const localeFiles = readMarkdownFiles(localeDir);
  if (localeFiles.length > 0) {
    return localeFiles.map((file) => ({ dir: localeDir, file }));
  }

  if (locale === "en") {
    return readMarkdownFiles(BLOG_DIR).map((file) => ({ dir: BLOG_DIR, file }));
  }

  return [];
}

function resolvePostSlug(data: Record<string, unknown>): string {
  if (data.slug) {
    return slugify(String(data.slug));
  }
  return slugify(String(data.title ?? ""));
}

function applyCjkLatinSpacing(text: string, locale: BlogLocale): string {
  if (locale !== "zh") {
    return text;
  }
  return text
    .replace(/([\u3400-\u9fff])([A-Za-z0-9]+)/g, "$1 $2")
    .replace(/([A-Za-z0-9]+)([\u3400-\u9fff])/g, "$1 $2");
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getBlogSlugs(locale: BlogLocale = "en"): string[] {
  return getBlogFiles(locale).map(({ dir, file }) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data } = matter(raw);
    return resolvePostSlug(data as Record<string, unknown>);
  });
}

export function getBlogPost(slug: string, locale: BlogLocale = "en"): BlogPost {
  if (/[/.]/.test(slug)) {
    throw new Error(`Invalid slug: "${slug}"`);
  }
  const blogFiles = getBlogFiles(locale);
  for (const { dir, file } of blogFiles) {
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    if (resolvePostSlug(data as Record<string, unknown>) !== slug) continue;
    if (!data.title || !data.excerpt) {
      throw new Error(
        `Blog post "${slug}" is missing required frontmatter fields`,
      );
    }
    const { birthtime, mtime } = fs.statSync(filePath);
    const title = applyCjkLatinSpacing(String(data.title), locale);
    const excerpt = applyCjkLatinSpacing(String(data.excerpt), locale);
    const spacedMarkdown = applyCjkLatinSpacing(String(content), locale);
    return {
      slug,
      title,
      createdAt: birthtime.toISOString().split("T")[0],
      updatedAt: data.updatedAt
        ? data.updatedAt instanceof Date
          ? data.updatedAt.toISOString().split("T")[0]
          : String(data.updatedAt)
        : mtime.toISOString().split("T")[0],
      excerpt,
      content: String(marked.parse(spacedMarkdown)),
    };
  }
  throw new Error(`No post found for slug: "${slug}"`);
}

export function getAllBlogPosts(locale: BlogLocale = "en"): BlogPost[] {
  return getBlogSlugs(locale)
    .map((slug) => getBlogPost(slug, locale))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}
