---
type: Tool
title: PDFKit
description: Generates the bilingual 50-item lead-magnet PDF, and the font trap that Hungarian accents create.
resource: https://pdfkit.org
tags: [pdf, pdfkit, lead-magnet, fonts, hungarian]
timestamp: 2026-08-07T00:00:00Z
---

`npm run pdf` in `web/` runs `scripts/generate-pdf.mts` (185 lines, **PDFKit** ^0.19.1) and writes
`public/thats-a-first-50.hu.pdf` and `public/thats-a-first-50.en.pdf` — A4, brand colors, checkboxes.
Each landing page links its own language's file. See [website](/project/website.md).

## The font trap

PDFKit's built-in fonts are **WinAnsi-encoded and cannot render `ő` and `ű`** — the two Hungarian
long-umlaut vowels. Any PDF built with the default font silently mangles them. The fix is an embedded
TrueType font:

```ts
process.env.FONT_PATH ?? "/System/Library/Fonts/Supplemental/Arial.ttf"
process.env.FONT_BOLD_PATH ?? "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
```

The script defaults to macOS Arial and **fails loudly** with an actionable message if the file is missing
(`scripts/generate-pdf.mts:28`) rather than producing a broken PDF. On any non-macOS machine, set
`FONT_PATH` / `FONT_BOLD_PATH` to a TTF that covers Hungarian accents.

Fonts are registered once as `body` / `bold` (`generate-pdf.mts:82-83`) and used by name thereafter.

## Brand rendering

The script draws the same design tokens as the site: paper `#f7f7f3`, ink `#1b2430`, cobalt `#2743d6`,
marker-yellow `#ffd84d`. The signature yellow highlighter swipe is drawn manually — measure the string
with `widthOfString`, then paint a rectangle behind it (`generate-pdf.mts:102-107`).

## Why a script, not a route

The PDF is a static lead magnet regenerated only when the collection changes, so it is a build-time
artifact committed to `public/` — not something to render per request.

# Citations

- Font resolution and failure message: `web/scripts/generate-pdf.mts:20-28`.
- Script registered as `npm run pdf`: `web/package.json:9`.
