---
type: Project
title: That's a First website (MVP)
description: A Next.js web MVP in /web — public collection + landing, admin outreach inbox, monthly newsletter builder with pluggable publishers, and a downloadable 50-item PDF.
resource: /web
tags: [website, nextjs, mvp, newsletter, outreach]
timestamp: 2026-08-07T00:00:00Z
---

The **website MVP** lives in the repo's `web/` directory (code only — **not deployed yet**).
It is the product layer on top of the [digest pipeline](/project/thats-a-first-digest.md):
the pipeline discovers people doing firsts; the website features them, grows the collection,
and drives the monthly newsletter.

## Stack

- **Next.js 16** (App Router, Turbopack), TypeScript, Tailwind v4. Note: async
  `params`/`searchParams` in Next 16 — see `web/AGENTS.md`.
- **SQLite via built-in `node:sqlite`** (Node 26; zero DB dependencies). File: `web/data/app.db`
  (gitignored), schema + auto-seed in `web/lib/db.ts`.
- **Bilingual (hu/en)**: locale-prefixed routes (`/hu`, `/en`) via `proxy.ts`
  (Accept-Language redirect); dictionaries in `web/lib/i18n/dictionaries.ts`; Hungarian URL
  aliases (`/hu/gyujtemeny` → internal `collection` route) via `next.config.ts` rewrites;
  `LocaleSwitcher` in the header. Admin UI copy stays Hungarian (internal tool).
- Design tokens: paper `#f7f7f3`, ink `#1b2430`, cobalt `#2743d6`,
  marker-yellow `#ffd84d`; fonts Bricolage Grotesque (display) + Instrument Sans (body).
  Signature motifs: yellow highlighter swipe + tickable checkbox.

## Pages

All routes are locale-prefixed (`/hu/...`, `/en/...`); unprefixed URLs redirect by browser language.

| Route | What it does |
|---|---|
| `/{hu,en}` | Landing: origin story (friend group, ~20 years, last Wednesday of every month), how-it-works, collection preview, PDF download CTA, newsletter signup. |
| `/hu/gyujtemeny` = `/en/collection` | Public browse of the 50-item curated collection, category filter via `?kategoria=` / `?category=`. |
| `.../gyujtemeny/[slug]` | Activity detail + **copyable friend-invite message** in the page's language (prefilled with link and the next last-Wednesday date). |
| `/{locale}/admin` | Dashboard (no auth in MVP — local use only; UI is Hungarian at any locale). |
| `.../admin/felfedezesek` | Crawler-discovery inbox: status flow `new → selected → contacted → featured / skipped`, per-post **outreach message generation in HU or EN** (IG/TikTok DM, copied and sent manually). |
| `.../admin/hirlevel` | Monthly issue builder: an issue = **month + language** (`?honap=`, `?nyelv=`); pick stories (discoveries) + inspiration (activities), subject/intro, live preview, HTML export. |
| `.../admin/hirlevel/[id]/elonezet` | Rendered issue HTML in the issue's language (`?letoltes=1` downloads it). |

## Data model (`web/lib/db.ts`)

`activities` (curated collection, seeded from `web/lib/seed-data/activities.ts` — 50 items in 7
neutral-key categories, **bilingual columns** `title_hu/en`, `description_hu/en`, `tags_hu/en`),
`discoveries` (same shape the [pipeline](/project/pipeline.md) produces:
platform/url/creator/text/likes/comments/date/image + the model's activity label; seeded with
samples until a real import exists), `subscribers` (with `locale` — who gets which language),
`newsletter_issues` (with `locale` — HU and EN issues are separate). A small dev-migration in
`db.ts` drops/reseeds the old monolingual `activities` table and adds missing columns.

## Newsletter model

- Send on the **first Wednesday** of the month; the email counts down the weeks to the
  **last Wednesday** ("még N heted van megszervezni") — date math in `web/lib/dates.ts`,
  e-mail-safe HTML in `web/lib/newsletter/render.ts`.
- **Substack has no official public API** (checked 2026-07; only reverse-engineered wrappers that
  can break anytime). Therefore delivery is a **pluggable publisher adapter**
  (`web/lib/newsletter/publishers/`): `manual` (export HTML → paste into any platform's editor —
  the supported path for Substack) and `buttondown` (real documented API; full automation once
  `BUTTONDOWN_API_KEY` is set).

## PDF lead magnet

`npm run pdf` (in `web/`) runs `scripts/generate-pdf.mts` → `public/thats-a-first-50.hu.pdf`
and `public/thats-a-first-50.en.pdf` (A4, brand colors, checkboxes; each landing links its own
language's file). Hungarian ő/ű need an embedded TTF: defaults to macOS Arial, override with
`FONT_PATH`/`FONT_BOLD_PATH`.

## Open ends (next steps)

- Real importer from the pipeline's picks into `discoveries` (today: seed samples). The importer
  should also fill `activity_label_en` (English label) — the English outreach/newsletter fall back
  to a neutral phrase / the Hungarian label when it is empty.
- Auth in front of `/admin` before any deploy.
- Newsletter platform decision: Buttondown-style API platform vs. manual Substack flow.
- Featured stories on the public site (the `featured` status exists, no public surface yet).

## See also

**Tech pages behind this MVP:** [nextjs](/tech/nextjs.md) (App Router, `proxy.ts`, rewrites) ·
[node-sqlite](/tech/node-sqlite.md) (storage, migrations) ·
[newsletter-delivery](/tech/newsletter-delivery.md) (Substack/Buttondown adapters) ·
[pdfkit](/tech/pdfkit.md) (the lead-magnet PDF).

**Project pages:** [thats-a-first-digest](/project/thats-a-first-digest.md) ·
[pipeline](/project/pipeline.md) · [decisions](/project/decisions.md)
