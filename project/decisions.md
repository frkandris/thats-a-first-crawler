---
type: Decision Log
title: Design decisions
description: Why the system is built the way it is — the non-obvious choices and what forced them.
resource: https://n8n.strt.hu/workflow/JEHhYDEEklYRoIHb
tags: [decisions, adr, rationale]
timestamp: 2026-07-04T00:00:00Z
---

Non-obvious choices, newest context on top. Each is a small ADR.

## Discovery via Apify, not web search
The original was a ChatGPT agent using web search; that could not target IG/TikTok reliably. We use
[Apify](/tech/apify.md) hashtag scrapers instead, assembled by one [Claude](/tech/claude-vision-api.md) call.

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
Changed from 07:00 to **06:00** on request. The Schedule node is still *labeled* "Every day 07:00";
its Trigger-at-Hour is 6am. Rename the node label if the mismatch is confusing.
