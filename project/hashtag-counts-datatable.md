---
type: Data Model
title: Hashtag counts Data Table
description: The n8n Data Table that stores each hashtag's total post count per day so the email can show the day-over-day delta.
resource: https://<n8n-host>/projects/<project-id>/datatables/<table-id>
tags: [datatable, hashtags, metrics, storage]
timestamp: 2026-08-07T00:00:00Z
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

## Why a stored total, not a counted sample

The main [Apify](/tech/apify.md) hashtag scrapers return only **12 posts per hashtag** (a
[cost decision](/project/decisions.md)), so counting "posts from the last 24 h" in that sample would cap
out at 12 and understate reality. Instead the
[`apify~instagram-hashtag-analytics-scraper`](/tech/apify.md#analytics) returns the hashtag's **lifetime
`postsCount`**; storing it daily makes the *difference between consecutive days* the real number of new
posts. See [decisions](/project/decisions.md#hashtag-delta).

## Read / write

- **Get counts** (Data Table, Return All) reads every row on a parallel branch from Config.
  [build-request-node](/project/build-request-node.md) picks, per hashtag, the row with the **most recent
  `checked_date` strictly before today** and computes `delta = today.posts_count - previous.posts_count`.
- **Insert count row** appends today's row per hashtag.

## Ordering invariant (important)

Today's rows are written on a branch that is **independent of `Has picks?`** — they must be stored even
on days when no email goes out. If the write were gated on a successful send, a single no-pick day would
break the following day's delta. See [pipeline](/project/pipeline.md).

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
