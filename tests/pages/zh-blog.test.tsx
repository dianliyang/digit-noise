import { render, screen } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

jest.mock("../../app/lib/blog", () => ({
  getAllBlogPosts: jest.fn(() => [
    {
      slug: "post-one",
      title: "Post One",
      createdAt: "January 1, 2025",
      excerpt: "First excerpt.",
      content: "<p>First content.</p>",
    },
  ]),
}));

import ZhBlogPage from "../../app/zh/blog/page";

test("renders Chinese blog heading", () => {
  render(<ZhBlogPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: "写作" })
  ).toBeInTheDocument();
});

test("links posts under /zh/blog", () => {
  render(<ZhBlogPage />);
  expect(screen.getByRole("link", { name: /post one/i })).toHaveAttribute(
    "href",
    "/zh/blog/post-one"
  );
});

test("renders explicit language switch for Chinese blog index", () => {
  render(<ZhBlogPage />);
  expect(screen.getByRole("link", { name: "EN" })).toHaveAttribute("href", "/blog");
  expect(screen.getByRole("link", { name: "中文" })).toHaveAttribute("href", "/zh/blog");
});
