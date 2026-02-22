jest.mock("fs");

import fs from "fs";
import { getBlogSlugs, getBlogPost, getAllBlogPosts, slugify } from "../../app/lib/blog";

const mockFs = fs as jest.Mocked<typeof fs>;

const MOCK_POST = `---
title: Test Post
excerpt: A test excerpt.
---

Test **content** here.
`;

const MOCK_STAT = {
  birthtime: new Date("2025-01-01T00:00:00.000Z"),
  mtime: new Date("2025-06-15T00:00:00.000Z"),
} as any;

beforeEach(() => {
  mockFs.readdirSync.mockReturnValue(["post.md"] as any);
  mockFs.readFileSync.mockReturnValue(MOCK_POST as any);
  mockFs.statSync.mockReturnValue(MOCK_STAT);
});

// slugify
test("slugify lowercases and hyphenates words", () => {
  expect(slugify("Hello World")).toBe("hello-world");
});

test("slugify collapses special characters into single hyphens", () => {
  expect(slugify("Sunshine & Shadows — 2025")).toBe("sunshine-shadows-2025");
});

test("slugify strips leading and trailing hyphens", () => {
  expect(slugify("  Hello  ")).toBe("hello");
});

// getBlogSlugs
test("getBlogSlugs returns slug derived from post title", () => {
  expect(getBlogSlugs()).toEqual(["test-post"]);
});

test("getBlogSlugs ignores non-markdown files", () => {
  mockFs.readdirSync.mockReturnValue(["post.md", ".DS_Store"] as any);
  expect(getBlogSlugs()).toEqual(["test-post"]);
});

// getBlogPost
test("getBlogPost finds post by title-derived slug", () => {
  expect(getBlogPost("test-post").title).toBe("Test Post");
});

test("getBlogPost returns the slug", () => {
  expect(getBlogPost("test-post").slug).toBe("test-post");
});

test("getBlogPost createdAt comes from file birthtime", () => {
  expect(getBlogPost("test-post").createdAt).toBe("2025-01-01");
});

test("getBlogPost updatedAt falls back to file mtime when not in frontmatter", () => {
  expect(getBlogPost("test-post").updatedAt).toBe("2025-06-15");
});

test("getBlogPost updatedAt comes from frontmatter when set", () => {
  const POST = `---\ntitle: Test Post\nexcerpt: Excerpt.\nupdatedAt: 2025-06-15\n---\nContent\n`;
  mockFs.readFileSync.mockReturnValue(POST as any);
  expect(getBlogPost("test-post").updatedAt).toBe("2025-06-15");
});

test("getBlogPost parses excerpt from frontmatter", () => {
  expect(getBlogPost("test-post").excerpt).toBe("A test excerpt.");
});

test("getBlogPost converts markdown body to HTML", () => {
  expect(getBlogPost("test-post").content).toContain("<strong>content</strong>");
});

test("getBlogPost throws for slug with path traversal characters", () => {
  expect(() => getBlogPost("../secret")).toThrow("Invalid slug");
  expect(() => getBlogPost("foo/bar")).toThrow("Invalid slug");
});

test("getBlogPost throws when required frontmatter fields are missing", () => {
  mockFs.readFileSync.mockReturnValue(`---\ntitle: Test Post\n---\nContent\n` as any);
  expect(() => getBlogPost("test-post")).toThrow("missing required frontmatter fields");
});

test("getBlogPost throws when no post matches slug", () => {
  expect(() => getBlogPost("nonexistent")).toThrow("No post found");
});

// getAllBlogPosts
test("getAllBlogPosts returns one post per file", () => {
  const POST_B = `---\ntitle: Another Post\nexcerpt: Another.\n---\nContent\n`;
  mockFs.readdirSync.mockReturnValue(["a.md", "b.md"] as any);
  mockFs.readFileSync.mockImplementation((fp: unknown) =>
    String(fp).endsWith("b.md") ? (POST_B as any) : (MOCK_POST as any)
  );
  expect(getAllBlogPosts()).toHaveLength(2);
});

test("getAllBlogPosts returns posts sorted newest first", () => {
  const POST_OLD = `---\ntitle: Old Post\nexcerpt: Old.\n---\nContent\n`;
  const POST_NEW = `---\ntitle: New Post\nexcerpt: New.\n---\nContent\n`;
  mockFs.readdirSync.mockReturnValue(["old.md", "new.md"] as any);
  mockFs.readFileSync.mockImplementation((fp: unknown) =>
    String(fp).endsWith("new.md") ? (POST_NEW as any) : (POST_OLD as any)
  );
  mockFs.statSync.mockImplementation((fp: unknown) =>
    String(fp).endsWith("new.md")
      ? ({ birthtime: new Date("2025-01-01"), mtime: new Date("2025-01-01") } as any)
      : ({ birthtime: new Date("2020-01-01"), mtime: new Date("2020-01-01") } as any)
  );
  const posts = getAllBlogPosts();
  expect(new Date(posts[0].createdAt).getTime()).toBeGreaterThan(
    new Date(posts[1].createdAt).getTime()
  );
});
