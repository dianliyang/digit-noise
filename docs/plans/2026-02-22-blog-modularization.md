# Blog Modularization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Break the monolithic `page.tsx` SPA into proper Next.js file-based routes with markdown-driven blog posts.

**Architecture:** Server components for all pages; markdown files in `content/blog/` processed at build time via `lib/blog.ts`; a single `"use client"` Nav component using `usePathname` for active-link state; static export via `output: "export"`.

**Tech Stack:** Next.js 16 App Router, `gray-matter` (frontmatter), `marked` (markdown→HTML), Jest + Testing Library.

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install**

```bash
npm install gray-matter marked
npm install --save-dev @types/marked
```

**Step 2: Verify**

```bash
node -e "require('gray-matter'); require('marked'); console.log('ok')"
```
Expected: `ok`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add gray-matter and marked"
```

---

### Task 2: Create markdown blog content

**Files:**
- Create: `content/blog/burden-of-choice.md`
- Create: `content/blog/black-and-white-web.md`

**Step 1: Create directory**

```bash
mkdir -p content/blog
```

**Step 2: Create `content/blog/burden-of-choice.md`**

```markdown
---
title: The Burden of Choice in UI Design
date: October 24, 2025
excerpt: Why removing options often leads to a significantly better user experience.
---

In modern interface design, we are obsessed with providing options. We give users toggles, dropdowns, themes, and endless customization. But every option is a cognitive load. Every choice is a micro-decision that distracts from the core task.

When we design with extreme minimalism, we aren't just making things look clean. We are making decisions on behalf of the user so they don't have to. We are taking on the burden of choice.

## Typography as the Interface

When you strip away borders, backgrounds, and drop shadows, typography becomes the interface. The relationship between a header and body text isn't just about aesthetics; it's the only navigational cue the user has.

This is why choosing a legible, highly functional font is critical. It's not about being fancy; it's about pure communication. System fonts excel here because they have been optimized by OS creators for thousands of hours specifically for screen reading.
```

**Step 3: Create `content/blog/black-and-white-web.md`**

```markdown
---
title: Defending the Black and White Web
date: September 12, 2025
excerpt: Color is a powerful tool, but its absence forces absolute clarity in layout and structure.
---

Designing without color is an exercise in brutal honesty. You cannot hide a poor layout behind a beautiful gradient. You cannot draw attention to a button simply by making it bright red.

When you restrict your palette to pure black and white, you are forced to use space, scale, and weight to establish hierarchy. A black and white website demands that the content be strong enough to stand on its own.

It's not a limitation; it's a focusing lens.
```

**Step 4: Commit**

```bash
git add content/
git commit -m "content: add initial blog posts as markdown"
```

---

### Task 3: Implement `app/lib/blog.ts` with TDD

**Files:**
- Create: `app/lib/blog.ts`
- Create: `tests/lib/blog.test.ts`

**Step 1: Write the failing tests**

Create `tests/lib/blog.test.ts`:

```ts
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
```

**Step 2: Run tests — expect failure**

```bash
npx jest tests/lib/blog.test.ts
```
Expected: FAIL — `Cannot find module '../../app/lib/blog'`

**Step 3: Implement `app/lib/blog.ts`**

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export function getBlogSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getBlogPost(slug: string): BlogPost {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    content: String(marked.parse(content)),
  };
}

export function getAllBlogPosts(): BlogPost[] {
  return getBlogSlugs().map(getBlogPost);
}
```

**Step 4: Run tests — expect pass**

```bash
npx jest tests/lib/blog.test.ts
```
Expected: PASS (8 tests)

**Step 5: Commit**

```bash
git add app/lib/blog.ts tests/lib/blog.test.ts
git commit -m "feat: add blog markdown utilities"
```

---

### Task 4: Implement `app/components/Nav.tsx` with TDD

**Files:**
- Create: `app/components/Nav.tsx`
- Create: `tests/components/nav.test.tsx`

**Step 1: Write the failing tests**

Create `tests/components/nav.test.tsx`:

```tsx
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
```

**Step 2: Run tests — expect failure**

```bash
npx jest tests/components/nav.test.tsx
```
Expected: FAIL — `Cannot find module '../../app/components/Nav'`

**Step 3: Implement `app/components/Nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="mb-20 flex flex-col justify-between gap-6 md:mb-32 md:flex-row md:items-center">
      <Link
        href="/"
        className="text-left text-xl font-medium tracking-tight transition-opacity hover:opacity-70"
      >
        Dianli Yang
      </Link>

      <nav className="flex gap-6 text-sm font-medium tracking-wide">
        {links.map(({ href, label }) => {
          const isActive =
            href === "/blog"
              ? pathname === "/blog" || pathname.startsWith("/blog/")
              : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`decoration-2 underline-offset-4 hover:underline ${isActive ? "underline" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
```

**Step 4: Run tests — expect pass**

```bash
npx jest tests/components/nav.test.tsx
```
Expected: PASS (7 tests)

**Step 5: Commit**

```bash
git add app/components/Nav.tsx tests/components/nav.test.tsx
git commit -m "feat: add Nav component with active-link state"
```

---

### Task 5: Refactor `app/layout.tsx`

Move the shared shell (Nav, footer, wrapper div) into layout so all pages inherit it.

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Update `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";

export const metadata: Metadata = {
  title: "Dianli Yang",
  description: "Minimalist portfolio and writing",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-white text-black font-sans selection:bg-black selection:text-white min-h-screen"
        suppressHydrationWarning
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-12 md:py-24">
          <Nav />
          <main>{children}</main>
          <footer className="mt-32 border-t border-black/10 pt-8 text-sm">
            <p>© {new Date().getFullYear()} Dianli Yang.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
```

**Step 2: Run all existing tests**

```bash
npm test
```
Expected: some tests fail (home.test.tsx references old SPA structure — will be replaced in Task 10)

**Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "refactor: move shell layout into RootLayout"
```

---

### Task 6: Implement `app/page.tsx` (Home)

**Files:**
- Modify: `app/page.tsx`

**Step 1: Replace with server component**

```tsx
export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-8 text-3xl font-medium leading-tight tracking-tighter md:text-5xl">
        I design and build digital spaces focused on absolute clarity.
      </h1>
      <div className="max-w-2xl space-y-6 text-lg leading-relaxed md:text-xl">
        <p>
          I am a software engineer and writer advocating for the reduction of
          digital noise. My work strips away the non-essential, leaving only
          typography, space, and intent.
        </p>
        <p>
          Currently based in Kiel, Germany. Working on making the web a quieter
          place to read and interact.
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "refactor: home as server component"
```

---

### Task 7: Implement `app/portfolio/page.tsx`

**Files:**
- Create: `app/portfolio/page.tsx`

**Step 1: Create**

```tsx
const portfolioItems = [
  {
    id: 1,
    title: "Typeface Analytics",
    description:
      "A dashboard for analyzing web typography legibility across different viewports.",
    year: "2025",
    role: "Design & Engineering",
  },
  {
    id: 2,
    title: "Monochrome Theme",
    description:
      "An ultra-minimalist, high-contrast theme developed for VS Code and standard IDEs.",
    year: "2024",
    role: "Creator",
  },
  {
    id: 3,
    title: "Ockham",
    description:
      "A distraction-free writing application that removes features as you write.",
    year: "2024",
    role: "Lead Developer",
  },
];

function ArrowUpRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-0 transition-opacity group-hover:opacity-100"
      aria-hidden="true"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export default function PortfolioPage() {
  return (
    <div className="animate-fade-in">
      <h2 className="mb-12 text-2xl font-medium tracking-tight">
        Selected Works
      </h2>
      <div className="flex flex-col gap-16">
        {portfolioItems.map((item) => (
          <article key={item.id} className="group cursor-pointer">
            <div className="mb-4 flex items-baseline justify-between border-b border-black pb-4">
              <h3 className="flex items-center gap-2 text-xl font-medium decoration-2 underline-offset-4 group-hover:underline">
                {item.title}
                <ArrowUpRight />
              </h3>
              <span className="text-sm">{item.year}</span>
            </div>
            <p className="max-w-xl text-lg leading-relaxed">{item.description}</p>
            <p className="mt-4 text-sm font-medium uppercase tracking-widest">
              {item.role}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/portfolio/page.tsx
git commit -m "feat: add portfolio page"
```

---

### Task 8: Implement `app/blog/page.tsx`

**Files:**
- Create: `app/blog/page.tsx`

**Step 1: Create**

```tsx
import Link from "next/link";
import { getAllBlogPosts } from "../lib/blog";

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="animate-fade-in">
      <h2 className="mb-12 text-2xl font-medium tracking-tight">Writing</h2>
      <div className="flex flex-col gap-12">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`} className="block">
              <time className="mb-3 block text-sm font-medium uppercase tracking-widest">
                {post.date}
              </time>
              <h3 className="mb-3 text-2xl font-medium leading-snug tracking-tight decoration-2 underline-offset-4 group-hover:underline md:text-3xl">
                {post.title}
              </h3>
              <p className="max-w-2xl text-lg leading-relaxed">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/blog/page.tsx
git commit -m "feat: add blog listing page"
```

---

### Task 9: Implement `app/blog/[slug]/page.tsx`

**Files:**
- Create: `app/blog/[slug]/page.tsx`

**Step 1: Create**

```tsx
import Link from "next/link";
import { getBlogPost, getBlogSlugs } from "../../lib/blog";

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  return (
    <div className="animate-slide-up">
      <Link
        href="/blog"
        className="mb-12 flex items-center gap-2 text-sm font-medium uppercase tracking-widest decoration-2 underline-offset-4 hover:underline"
      >
        ← Back to Blog
      </Link>

      <article>
        <header className="mb-12">
          <time className="mb-4 block text-sm font-medium uppercase tracking-widest">
            {post.date}
          </time>
          <h1 className="text-4xl font-medium leading-tight tracking-tighter md:text-5xl">
            {post.title}
          </h1>
        </header>

        <div
          className="prose prose-lg prose-p:leading-loose max-w-none md:prose-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/blog/
git commit -m "feat: add blog post page with generateStaticParams"
```

---

### Task 10: Replace old tests with new page tests

The old `tests/home.test.tsx` tests the SPA structure which no longer exists. Delete it and write targeted tests for each new component.

**Files:**
- Delete: `tests/home.test.tsx`
- Create: `tests/pages/home.test.tsx`
- Create: `tests/pages/portfolio.test.tsx`
- Create: `tests/pages/blog.test.tsx`
- Create: `tests/pages/blog-post.test.tsx`

**Step 1: Delete old test file**

```bash
rm tests/home.test.tsx
```

**Step 2: Create `tests/pages/home.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "../../app/page";

test("renders headline", () => {
  render(<HomePage />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /i design and build digital spaces/i,
    })
  ).toBeInTheDocument();
});

test("renders location copy", () => {
  render(<HomePage />);
  expect(screen.getByText(/currently based in kiel/i)).toBeInTheDocument();
});

test("renders quiet web copy", () => {
  render(<HomePage />);
  expect(screen.getByText(/making the web a quieter place/i)).toBeInTheDocument();
});
```

**Step 3: Create `tests/pages/portfolio.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import PortfolioPage from "../../app/portfolio/page";

test("renders Selected Works heading", () => {
  render(<PortfolioPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: /selected works/i })
  ).toBeInTheDocument();
});

test("renders all three portfolio items", () => {
  render(<PortfolioPage />);
  expect(screen.getByText("Typeface Analytics")).toBeInTheDocument();
  expect(screen.getByText("Monochrome Theme")).toBeInTheDocument();
  expect(screen.getByText("Ockham")).toBeInTheDocument();
});

test("renders role labels", () => {
  render(<PortfolioPage />);
  expect(screen.getByText("Design & Engineering")).toBeInTheDocument();
  expect(screen.getByText("Creator")).toBeInTheDocument();
  expect(screen.getByText("Lead Developer")).toBeInTheDocument();
});

test("renders year for each item", () => {
  render(<PortfolioPage />);
  expect(screen.getByText("2025")).toBeInTheDocument();
});
```

**Step 4: Create `tests/pages/blog.test.tsx`**

```tsx
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
```

**Step 5: Create `tests/pages/blog-post.test.tsx`**

```tsx
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
```

**Step 6: Run all tests**

```bash
npm test
```
Expected: PASS (all new tests green, old SPA tests gone)

**Step 7: Commit**

```bash
git add tests/
git commit -m "test: replace SPA tests with page-level tests"
```

---

### Task 11: Verify build

**Step 1: Build**

```bash
npm run build
```
Expected: static pages generated for `/`, `/portfolio`, `/blog`, `/blog/burden-of-choice`, `/blog/black-and-white-web`

**Step 2: Spot-check output**

```bash
ls out/blog/
```
Expected: `burden-of-choice/`, `black-and-white-web/`, `index.html`

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: modular Next.js pages with markdown blog"
```
