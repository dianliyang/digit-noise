import Link from "next/link";
import type { BlogLocale } from "../../lib/blog";

export default function BlogLanguageSwitch({
  locale,
  slug,
}: {
  locale: BlogLocale;
  slug?: string;
}) {
  const enHref = slug ? `/blog/${slug}` : "/blog";
  const zhHref = slug ? `/zh/blog/${slug}` : "/zh/blog";

  return (
    <nav aria-label="Language switch" className="mb-10 flex items-center gap-3 text-sm font-medium">
      <Link
        href={enHref}
        aria-current={locale === "en" ? "page" : undefined}
        className={`decoration-2 underline-offset-4 hover:underline ${locale === "en" ? "underline" : ""}`}
      >
        EN
      </Link>
      <span aria-hidden="true" className="text-black/30">
        /
      </span>
      <Link
        href={zhHref}
        aria-current={locale === "zh" ? "page" : undefined}
        className={`decoration-2 underline-offset-4 hover:underline ${locale === "zh" ? "underline" : ""}`}
      >
        中文
      </Link>
    </nav>
  );
}
