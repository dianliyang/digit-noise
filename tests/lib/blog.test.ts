jest.mock("fs");

import fs from "fs";
import { getBlogSlugs, getBlogPost, getAllBlogPosts } from "../../app/lib/blog";

const mockFs = fs as jest.Mocked<typeof fs>;

const MOCK_POST = `---
title: Test Post
date: January 1, 2025
excerpt: A test excerpt.
---

Test **content** here.
`;

beforeEach(() => {
  mockFs.readdirSync.mockReturnValue(["test-post.md", "another.md"] as any);
  mockFs.readFileSync.mockReturnValue(MOCK_POST as any);
});

test("getBlogSlugs strips .md and returns slugs", () => {
  expect(getBlogSlugs()).toEqual(["test-post", "another"]);
});

test("getBlogSlugs ignores non-markdown files", () => {
  mockFs.readdirSync.mockReturnValue(["test-post.md", ".DS_Store"] as any);
  expect(getBlogSlugs()).toEqual(["test-post"]);
});

test("getBlogPost parses title from frontmatter", () => {
  expect(getBlogPost("test-post").title).toBe("Test Post");
});

test("getBlogPost parses date from frontmatter", () => {
  expect(getBlogPost("test-post").date).toBe("January 1, 2025");
});

test("getBlogPost parses excerpt from frontmatter", () => {
  expect(getBlogPost("test-post").excerpt).toBe("A test excerpt.");
});

test("getBlogPost returns the slug", () => {
  expect(getBlogPost("test-post").slug).toBe("test-post");
});

test("getBlogPost converts markdown body to HTML", () => {
  expect(getBlogPost("test-post").content).toContain("<strong>content</strong>");
});

test("getAllBlogPosts returns one post per slug", () => {
  expect(getAllBlogPosts()).toHaveLength(2);
});
