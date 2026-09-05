import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages serves a pre-rendered `out/` directory. Keep static export
  // scoped to that deployment build so local/server builds can return 404 for
  // slugs that are not in generateStaticParams().
  ...(process.env.NEXT_STATIC_EXPORT === "true" ? { output: "export" } : {}),
};

export default nextConfig;
