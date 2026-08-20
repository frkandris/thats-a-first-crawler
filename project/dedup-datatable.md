---
type: Data Model
title: Dedup Data Table
description: The n8n Data Table that records already-sent posts so the digest never repeats an item.
resource: https://<n8n-host>/projects/<project-id>/datatables/<table-id>
tags: [datatable, dedup, storage]
timestamp: 2026-08-20T00:00:00Z
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

- **Get sent** (Data Table, Return All, `Execute Once`) is wired **in line** — `Config → Get sent →
  Apify - Instagram → …` — so it has definitely executed by the time
  [build-request-node](/project/build-request-node.md) references it as `$('Get sent')`. It drops any
  candidate whose **canonicalized** URL is already present. Canonicalization (`canon()`: lowercase, strip
  query/fragment, unify Instagram `reel`/`tv` → `p`, drop trailing slash) makes dedup robust to URL-format
  differences (e.g. the same post scraped once as `/reel/…` and once as `/p/…`).
- **Insert row** appends one row per pick after the email is sent (fed by **Split picks**).

## <a id="silent-failure"></a>It was silently broken until 2026-08-10

**Get sent used to hang off Config as a parallel branch**, and n8n runs a parallel branch at the *end* of
the execution — after Build request had already asked for it. `$('Get sent')` therefore threw, the
`try/catch` around it swallowed the error, and the filter ran against an **empty set**: every candidate
passed. See [n8n](/tech/n8n.md#branch-order).

Nothing surfaced this. The node showed a healthy item count in the UI (it *did* run, just too late), and
the wiki claimed dedup was robust because `canon()` was reviewed as correct — it is; it simply never
received data.

Evidence found in the table itself: **183 rows but only 147 unique canonical URLs**, i.e. 21 posts were
emailed more than once — one TikTok five times (2026-07-17, 07-21, 07-25, 07-29, 08-03), one three days
running (07-17/18/19). The 2026-08-08 digest repeated **4 of its 5 picks** from 08-07.

Fixed by wiring the readers in line and replacing the `try/catch` with a thrown error naming the cause.
Build request now also returns `sentRowCount` so an empty read is visible in the run
data instead of being invisible.

## Behavior

Because filtering happens before selection, a post that was already emailed can never be picked again —
**provided Get sent is an ancestor of Build request**. Candidates that were analyzed but not picked are
**not** stored (there is no image-analysis cache — the user declined one on 2026-07-04; see
[decisions](/project/decisions.md)).
