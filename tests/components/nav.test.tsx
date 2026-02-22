import { render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import { usePathname } from "next/navigation";
import Nav from "../../app/components/Nav";

const mockPathname = usePathname as jest.Mock;

test("renders brand name linking to home", () => {
  mockPathname.mockReturnValue("/");
  render(<Nav />);
  expect(screen.getByRole("link", { name: "Dianli Yang" })).toHaveAttribute("href", "/");
});

test("renders Home, Portfolio, and Blog nav links", () => {
  mockPathname.mockReturnValue("/");
  render(<Nav />);
  expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Portfolio" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();
});

test("Home link is underlined when on home route", () => {
  mockPathname.mockReturnValue("/");
  render(<Nav />);
  expect(screen.getByRole("link", { name: "Home" })).toHaveClass("underline");
});

test("Portfolio link is underlined when on portfolio route", () => {
  mockPathname.mockReturnValue("/portfolio");
  render(<Nav />);
  expect(screen.getByRole("link", { name: "Portfolio" })).toHaveClass("underline");
});

test("Blog link is underlined when on blog route", () => {
  mockPathname.mockReturnValue("/blog");
  render(<Nav />);
  expect(screen.getByRole("link", { name: "Blog" })).toHaveClass("underline");
});

test("Blog link is underlined when on a blog post route", () => {
  mockPathname.mockReturnValue("/blog/some-post");
  render(<Nav />);
  expect(screen.getByRole("link", { name: "Blog" })).toHaveClass("underline");
});

test("only the active link is underlined", () => {
  mockPathname.mockReturnValue("/portfolio");
  render(<Nav />);
  expect(screen.getByRole("link", { name: "Home" })).not.toHaveClass("underline");
  expect(screen.getByRole("link", { name: "Blog" })).not.toHaveClass("underline");
});
