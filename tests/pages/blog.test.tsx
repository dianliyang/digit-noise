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
      date: "January 1, 2025",
      excerpt: "First excerpt.",
      content: "<p>First content.</p>",
    },
    {
      slug: "post-two",
      title: "Post Two",
      date: "February 1, 2025",
      excerpt: "Second excerpt.",
      content: "<p>Second content.</p>",
    },
  ]),
}));

import BlogPage from "../../app/blog/page";

test("renders Writing heading", () => {
  render(<BlogPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: /writing/i })
  ).toBeInTheDocument();
});

test("renders all post titles", () => {
  render(<BlogPage />);
  expect(screen.getByRole("heading", { level: 3, name: "Post One" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 3, name: "Post Two" })).toBeInTheDocument();
});

test("renders post excerpts", () => {
  render(<BlogPage />);
  expect(screen.getByText("First excerpt.")).toBeInTheDocument();
  expect(screen.getByText("Second excerpt.")).toBeInTheDocument();
});

test("each post links to its slug URL", () => {
  render(<BlogPage />);
  expect(screen.getByRole("link", { name: /post one/i })).toHaveAttribute(
    "href",
    "/blog/post-one"
  );
});
