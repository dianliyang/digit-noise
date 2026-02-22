import { render, screen } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

jest.mock("../../app/lib/blog", () => ({
  getBlogPost: jest.fn(() => ({
    slug: "test-post",
    title: "Test Post Title",
    date: "March 1, 2025",
    excerpt: "Test excerpt.",
    content: "<p>Test body content.</p><h2>A heading</h2>",
  })),
  getBlogSlugs: jest.fn(() => ["test-post"]),
}));

import BlogPostPage from "../../app/blog/[slug]/page";

async function renderPost() {
  const jsx = await BlogPostPage({ params: Promise.resolve({ slug: "test-post" }) });
  render(jsx);
}

test("renders post title as h1", async () => {
  await renderPost();
  expect(
    screen.getByRole("heading", { level: 1, name: "Test Post Title" })
  ).toBeInTheDocument();
});

test("renders post date", async () => {
  await renderPost();
  expect(screen.getByText("March 1, 2025")).toBeInTheDocument();
});

test("renders post body HTML", async () => {
  await renderPost();
  expect(screen.getByText("Test body content.")).toBeInTheDocument();
});

test("renders back to blog link", async () => {
  await renderPost();
  expect(
    screen.getByRole("link", { name: /back to blog/i })
  ).toHaveAttribute("href", "/blog");
});
