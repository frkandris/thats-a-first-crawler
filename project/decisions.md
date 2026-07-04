---
type: Decision Log
title: Design decisions
description: Why the system is built the way it is — the non-obvious choices and what forced them.
resource: https://n8n.strt.hu/workflow/JEHhYDEEklYRoIHb
tags: [decisions, adr, rationale]
timestamp: 2026-07-04T00:00:00Z
---

Non-obvious choices, newest context on top. Each is a small ADR.

## 30-day window + fetch more (2026-07-04)
The 7-day window plus small `resultsLimit` kept surfacing the same viral posts. Raised the search
window to **30 days** and Apify to **50 per hashtag** (Apify is cheap) for a much larger, fresher pool.

## Robust URL dedup (canon)
Repeats slipped through because the same post can be scraped in different URL formats
(`/reel/ABC` vs `/p/ABC`, trailing slash, query string). Dedup now compares a **canonicalized** URL on
both sides (`canon()`), so format differences no longer defeat it. See
[dedup-datatable](/project/dedup-datatable.md). Known limitation: *different* posts about the same viral
event (reposts) share no URL and are not deduped — content-level dedup was considered and not built.

## Prioritize genuine first-time signals for analysis
Only the top candidates by engagement were vision-analyzed, and high-engagement `#thatsafirst` posts skew
viral/fun — so few genuine firsts survived the filter (once a run returned a single item). Candidates are
now ranked for analysis by **first-time keyword signal first** (`first time`, `day one`, `először`, …),
then engagement, and the analyzed pool was raised **15 → 30**. This reliably yields ~5 genuine picks.

## Exclude fun/commercial non-firsts
A "5DX cinema" item was picked — a consumed entertainment product, not a personal first. The selection
prompt now explicitly excludes ads/promos, paid attractions/entertainment products, and generic "fun"
content, and prefers fewer but genuine picks (down to 0). See [ranking-algorithm](/project/ranking-algorithm.md).

## Discovery via Apify, not web search
Web search could not target Instagram/TikTok reliably, so discovery uses
[Apify](/tech/apify.md) hashtag scrapers, assembled by one [Claude](/tech/claude-vision-api.md) call.

## Execute Once on Apify nodes
The TikTok HTTP node fired **once per input item** (40 IG items → 40 concurrent Apify runs), exhausting
16 GB memory and ~$4 of credit. Fixed with `Execute Once` + `memory=4096` on both Apify nodes.

## <a id="images"></a>Claude images: base64, not URL
Passing `source.type:"url"` (even via the wsrv proxy) returns **400 "This URL is disallowed by the
website's robots.txt file."** Anthropic's fetcher honors robots.txt. So
[build-request-node](/project/build-request-node.md) downloads each image and sends
`source.type:"base64"`.

## wsrv.nl proxy for email display
Raw Instagram `displayUrl` does not render in Gmail (hotlink protection / Google image proxy).
Routing through [wsrv.nl](/tech/wsrv-image-proxy.md) (`?url=…&w=360&output=jpg`) makes both IG and
TikTok images render **and** gives consistent sizing.

## Deterministic ranking in code
The user wanted explicit, tunable ordering. Claude extracts parameters (from text **and** image); the
[score and sort](/project/ranking-algorithm.md) are computed in code, so weights are auditable and stable.

## Prompt language & examples
Accent-less prompts produced accent-less output, and negative "Először" examples got copied verbatim.
Fix: write the prompt in **accented Hungarian** with **positive** activity-first examples only.

## Remove the n8n footer
Minimalist requirement → Gmail node "Append n8n Attribution" turned off.

## No image-analysis cache
Considered caching vision results per URL to avoid re-analyzing recurring candidates. The user
**declined** it (2026-07-04). Do not build it; see [dedup-datatable](/project/dedup-datatable.md).

## Schedule 06:00
Changed from 07:00 to **06:00** on request; the Schedule node was renamed to "Every day 06:00" to match.
