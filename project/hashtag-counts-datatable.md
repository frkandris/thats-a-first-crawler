---
type: Data Model
title: Hashtag counts Data Table
description: SUPERSEDED 2026-08-20 — The n8n Data Table that stores each hashtag's total post count per day so the email can show the day-over-day delta.
resource: https://<n8n-host>/projects/<project-id>/datatables/<table-id>
tags: [datatable, hashtags, metrics, storage]
timestamp: 2026-08-19T00:00:00Z
---

An [n8n](/tech/n8n.md) **Data Table** named `thats_a_first_hashtag_counts`. It exists so the digest can
answer *"how many new posts appeared under each hashtag since yesterday"* — see the
[hashtag delta block](/project/email-format.md#hashtag-delta) in the email.

# Schema

| Column | Type | Notes |
|---|---|---|
| `hashtag` | string | without `#`, lowercase — e.g. `thatsafirst` |
| `posts_count` | number | the hashtag's **total** post count as reported by Apify on that day |
| `checked_date` | string | `runDate` (`YYYY-MM-DD`) — one row per hashtag per day |

> **Removed from the pipeline on 2026-08-20.** The table still exists and keeps its 20 rows, but nothing
> writes to it and nothing reads it: the feature it fed was dropped because **its data source never
> moved**. See [decisions](/project/decisions.md#drop-hashtag-counts). This page is kept because the table
> is still there — and because the reasoning below is correct and would apply again if a source with real
> daily numbers ever appears.

## Why a stored total, not a counted sample

The main [Apify](/tech/apify.md) hashtag scrapers return only **12 posts per hashtag** (a
[cost decision](/project/decisions.md)), so counting "posts from the last 24 h" in that sample would cap
out at 12 and understate reality. Instead the
[`apify~instagram-hashtag-analytics-scraper`](/tech/apify.md#analytics) returns the hashtag's **lifetime
`postsCount`**; storing it daily makes the *difference between consecutive days* the real number of new
posts. See [decisions](/project/decisions.md#hashtag-delta).

## Read / write

- **Get counts** (Data Table, Return All) read every row; it was wired in line ahead of Build request.
  [build-request-node](/project/build-request-node.md) picks, per hashtag, the row with the **most recent
  `checked_date` strictly before today** and computes `delta = today.posts_count - previous.posts_count`.
- **Insert count row** appended today's row per hashtag.

## Ordering invariant (important)

Today's rows are written on a branch that is **independent of `Has picks?`** — they must be stored even
on days when no email goes out. If the write were gated on a successful send, a single no-pick day would
break the following day's delta. See [pipeline](/project/pipeline.md).

**Independence was not enough.** n8n runs the targets of one output in list order and a failure ends the
run, so while the model node sat *before* `Split counts` in `Build request`'s output list, a failing model
call also killed the counts write. That is exactly what happened between **2026-08-15 and 08-19**: five
consecutive failed mornings (DeepSeek `402`, then the router `502`) wrote **no rows at all**, so the
2026-08-19 digest compared against an 11-day-old total and every delta clamped to `0`.

The fix was ordering — `Split counts` moved first in that output list — and it worked for exactly one day
before the feature was removed for the unrelated reason above. `scripts/check_wiring.py` still enforces the
rule for any future branch of this kind.

**Reading the damage:** the gap is visible as a `spanDays` jump in the email block (`11 nap alatt`). The
missing days cannot be backfilled — Apify's analytics actor reports *today's* total, not a historical
series — so the delta stays coarse until the next clean day.

## Edge cases

| Case | Behavior |
|---|---|
| First ever run (no previous row) | No delta; the block renders `első mérés` for that hashtag. |
| Workflow was down for N days | The previous row is N days old; the delta covers N days and the block says `N nap alatt`. |
| `postsCount` decreased (posts deleted / Apify revision) | Negative delta is clamped to `0` and rendered as `—`, not as a negative number. |
| A hashtag missing from the Apify response | Skipped for the day; no row written, so the next delta simply spans a longer window. |

## Relationship to the dedup table

Separate concern, separate table. [dedup-datatable](/project/dedup-datatable.md) prevents repeats of
individual posts; this one only tracks aggregate hashtag volume. They share no keys.
