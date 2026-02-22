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

test("getBlogSlugs reads locale-specific directory", () => {
  const EN_POST = `---\ntitle: English Post\nexcerpt: English.\n---\nContent\n`;
  const ZH_POST = `---\ntitle: 中文文章\nslug: english-post\nexcerpt: 中文。\n---\n内容\n`;

  mockFs.readdirSync.mockImplementation((dir: unknown) => {
    const resolved = String(dir);
    if (resolved.endsWith("/content/blog/zh")) return ["zh.md"] as any;
    if (resolved.endsWith("/content/blog/en")) return ["en.md"] as any;
    return [] as any;
  });
  mockFs.readFileSync.mockImplementation((fp: unknown) => {
    const resolved = String(fp);
    if (resolved.endsWith("/zh/zh.md")) return ZH_POST as any;
    if (resolved.endsWith("/en/en.md")) return EN_POST as any;
    return MOCK_POST as any;
  });

  expect(getBlogSlugs("zh")).toEqual(["english-post"]);
  expect(getBlogSlugs("en")).toEqual(["english-post"]);
});

test("getBlogSlugs falls back to legacy content/blog for en", () => {
  const LEGACY_POST = `---\ntitle: Legacy Post\nexcerpt: Legacy.\n---\nContent\n`;
  mockFs.readdirSync.mockImplementation((dir: unknown) => {
    const resolved = String(dir);
    if (resolved.endsWith("/content/blog/en")) return [] as any;
    if (resolved.endsWith("/content/blog")) return ["legacy.md"] as any;
    return [] as any;
  });
  mockFs.readFileSync.mockImplementation((fp: unknown) => {
    const resolved = String(fp);
    if (resolved.endsWith("/content/blog/legacy.md")) return LEGACY_POST as any;
    return MOCK_POST as any;
  });

  expect(getBlogSlugs("en")).toEqual(["legacy-post"]);
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

test("getBlogPost uses locale-specific source files", () => {
  const EN_POST = `---\ntitle: English Post\nslug: shared-post\nexcerpt: English excerpt.\n---\nEnglish body\n`;
  const ZH_POST = `---\ntitle: 中文文章\nslug: shared-post\nexcerpt: 中文摘要。\n---\n中文正文\n`;
  mockFs.readdirSync.mockImplementation((dir: unknown) => {
    const resolved = String(dir);
    if (resolved.endsWith("/content/blog/zh")) return ["zh.md"] as any;
    if (resolved.endsWith("/content/blog/en")) return ["en.md"] as any;
    return ["post.md"] as any;
  });
  mockFs.readFileSync.mockImplementation((fp: unknown) => {
    const resolved = String(fp);
    if (resolved.endsWith("/zh/zh.md")) return ZH_POST as any;
    if (resolved.endsWith("/en/en.md")) return EN_POST as any;
    return MOCK_POST as any;
  });

  expect(getBlogPost("shared-post", "zh").excerpt).toBe("中文摘要。");
  expect(getBlogPost("shared-post", "en").excerpt).toBe("English excerpt.");
});

test("getBlogPost adds spacing between Chinese and Latin text for zh locale", () => {
  const ZH_POST = `---\ntitle: APS材料准备\nslug: shared-post\nexcerpt: 准备繁琐的APS材料。\n---\n准备繁琐的APS材料。\n`;
  mockFs.readdirSync.mockImplementation((dir: unknown) => {
    const resolved = String(dir);
    if (resolved.endsWith("/content/blog/zh")) return ["zh.md"] as any;
    return [] as any;
  });
  mockFs.readFileSync.mockImplementation((fp: unknown) => {
    const resolved = String(fp);
    if (resolved.endsWith("/zh/zh.md")) return ZH_POST as any;
    return MOCK_POST as any;
  });

  const post = getBlogPost("shared-post", "zh");
  expect(post.title).toBe("APS 材料准备");
  expect(post.excerpt).toBe("准备繁琐的 APS 材料。");
  expect(post.content).toContain("准备繁琐的 APS 材料。");
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
