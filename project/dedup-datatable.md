---
type: Data Model
title: Dedup Data Table
description: The n8n Data Table that records already-sent posts so the digest never repeats an item.
resource: https://<n8n-host>/projects/<project-id>/datatables/<table-id>
tags: [datatable, dedup, storage]
timestamp: 2026-07-04T00:00:00Z
---

Deduplication uses an [n8n](/tech/n8n.md) **Data Table** named `thats_a_first_sent`.

# Schema

| Column | Type | Notes |
|---|---|---|
| `url` | string | canonical post URL, query string stripped (`split('?')[0]`) — the dedup key |
| `platform` | string | `Instagram` / `TikTok` |
| `creator` | string | unused (empty) — kept for schema stability |
| `activity` | string | the pick's `line` (human-readable label) |
| `sent_date` | string | `runDate` (`YYYY-MM-DD`) |

## Read / write

- **Get sent** (Data Table, Return All) reads every row on a parallel branch from Config;
  [build-request-node](/project/build-request-node.md) references it as `$('Get sent')` and drops any
  candidate whose **canonicalized** URL is already present. Canonicalization (`canon()`: lowercase, strip
  query/fragment, unify Instagram `reel`/`tv` → `p`, drop trailing slash) makes dedup robust to URL-format
  differences (e.g. the same post scraped once as `/reel/…` and once as `/p/…`).
- **Insert row** appends one row per pick after the email is sent (fed by **Split picks**).

## Behavior

Because filtering happens before selection, a post that was already emailed can never be picked again.
Candidates that were analyzed but not picked are **not** stored (there is no image-analysis cache — the
user declined one on 2026-07-04; see [decisions](/project/decisions.md)).
