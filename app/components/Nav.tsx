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
