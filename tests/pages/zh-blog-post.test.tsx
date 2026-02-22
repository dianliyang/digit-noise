import { render, screen } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

const mockNotFound = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

jest.mock("../../app/lib/blog", () => ({
  getBlogPost: jest.fn(() => ({
    slug: "test-post",
    title: "Test Post Title",
    createdAt: "March 1, 2025",
    updatedAt: "June 15, 2025",
    excerpt: "Test excerpt.",
    content: "<p>Test body content.</p>",
  })),
  getBlogSlugs: jest.fn(() => ["test-post"]),
}));

import ZhBlogPostPage from "../../app/zh/blog/[slug]/page";
import { getBlogPost } from "../../app/lib/blog";

const mockGetBlogPost = getBlogPost as jest.Mock;

async function renderPost() {
  const jsx = await ZhBlogPostPage({ params: Promise.resolve({ slug: "test-post" }) });
  render(jsx);
}

test("renders Chinese back link and href", async () => {
  await renderPost();
  expect(
    screen.getByRole("link", { name: /返回博客/i })
  ).toHaveAttribute("href", "/zh/blog");
});

test("renders Chinese updated label", async () => {
  await renderPost();
  expect(screen.getByText(/更新于 June 15, 2025/i)).toBeInTheDocument();
});

test("returns notFound when zh content for a slug is missing", async () => {
  mockGetBlogPost.mockImplementationOnce(() => {
    throw new Error('No post found for slug: "missing-post"');
  });

  await expect(
    ZhBlogPostPage({ params: Promise.resolve({ slug: "missing-post" }) })
  ).rejects.toThrow("NEXT_NOT_FOUND");
  expect(mockNotFound).toHaveBeenCalled();
});
