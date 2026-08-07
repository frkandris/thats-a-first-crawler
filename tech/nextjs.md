---
type: Tool
title: Next.js 16
description: The App Router framework behind the website MVP, including the Next 16 specifics that differ from older versions.
resource: https://nextjs.org
tags: [nextjs, react, app-router, i18n, typescript]
timestamp: 2026-08-07T00:00:00Z
---

The [website](/project/website.md) runs on **Next.js 16.2.11** with React 19.2.4, TypeScript and
Tailwind v4 (`web/package.json`). App Router, Turbopack.

## Next 16 specifics that bite

`web/AGENTS.md` carries a standing warning: *"This is NOT the Next.js you know… Read the relevant guide
in `node_modules/next/dist/docs/` before writing any code."* Treat training-data memory of Next.js as
suspect here. Two concrete differences this repo relies on:

- **`proxy.ts`, not `middleware.ts`.** The request interceptor lives at `web/proxy.ts` and exports a
  function named `proxy` plus a `config.matcher` (`web/proxy.ts:15,26`). Same role as the old middleware.
- **`params` / `searchParams` are async** in pages and route handlers — they must be awaited.

## How this app uses it

| Feature | Where | What it does |
|---|---|---|
| Locale redirect | `web/proxy.ts` | Reads `accept-language`, redirects unprefixed paths to `/hu` or `/en`. Matcher `/((?!_next\|.*\\..*).*)` skips internals and any path containing a dot. |
| Hungarian URL aliases | `web/next.config.ts:6-17` | `rewrites()` maps `/:locale(hu\|en)/gyujtemeny[/:slug]` → the internal `collection` route, so Hungarian URLs stay Hungarian without duplicating route folders. |
| Locale-prefixed routes | `web/app/[locale]/…` | One route tree, two languages; admin lives under `app/[locale]/admin`. |
| Server actions | `web/app/[locale]/actions.ts`, `admin/actions.ts` | Form handling without an API layer. |
| Route handler | `admin/hirlevel/[id]/elonezet/route.ts` | Serves the rendered newsletter HTML (`?letoltes=1` downloads). |

## Convention

Route **folders** are English (`collection`, `admin`); the Hungarian surface comes from rewrites and
dictionaries (`web/lib/i18n/dictionaries.ts`). Admin UI copy stays Hungarian at any locale — it is an
internal tool.

# Citations

- Version pins: `web/package.json:12-15`.
- The "not the Next.js you know" rule: `web/AGENTS.md` (included into `web/CLAUDE.md`).
