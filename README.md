# digit-noise

Minimalist portfolio for Dianli Yang. Built with Next.js and Tailwind CSS.

## Stack

- Next.js 16 (App Router, static export)
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
npm run deploy    # next build && wrangler pages deploy out
```

First-time setup:

```bash
wrangler pages project create digit-noise
```

Or connect the GitHub repo in the Cloudflare dashboard with build command `npm run build` and output directory `out`.
