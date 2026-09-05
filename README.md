# digit-noise

Minimalist portfolio for Dianli Yang. Built with Next.js and Tailwind CSS.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
- Jest + Testing Library
- Cloudflare Pages

## Dev

```bash
npm install
npm run dev       # http://localhost:3000
npm test
```

## Deploy

```bash
npm run deploy    # static build, then wrangler pages deploy out
```

First-time setup:

```bash
wrangler pages project create digit-noise
```

Or connect the GitHub repo in the Cloudflare dashboard with build command
`npm run build:pages` and output directory `out`. Do not use
`@cloudflare/next-on-pages`; this project publishes a static export directly.
