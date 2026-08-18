---
type: Pipeline
title: Workflow pipeline
description: The n8n node chain and data flow of That's a First Digest, node by node.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [pipeline, n8n, dataflow]
timestamp: 2026-08-18T00:00:00Z
---

The [project](/project/thats-a-first-digest.md) is a single [n8n](/tech/n8n.md) workflow. It is one
mostly-linear chain; the only fork is after **Build request**, where the counts branch splits off.

## Node chain

```
Schedule (06:00) → Config → Get sent → Get counts → Apify Instagram → Apify TikTok
   → Apify Hashtag stats → Build request ─┬─► AI - Meetapedia router ─► Parse response ─► Has picks?
                                          │                                    │(true)
                                          │                                    ▼
                                          │                              Gmail send ─► Split picks ─► Insert row
                                          └─► Split counts ─► Insert count row
```

**The two table reads are in line, on purpose.** They used to hang off Config as parallel branches, which
made them execute at the *end* of the run — after Build request had already tried to read them — and
[silently killed dedup for weeks](/project/dedup-datatable.md#silent-failure). Any node referenced with
`$('X')` must be an **ancestor** of the node referencing it. See [n8n](/tech/n8n.md#branch-order).

| Node | Type | Role |
|---|---|---|
| **Every day 06:00** | Schedule Trigger | Fires daily 06:00 Europe/Berlin. |
| **Config** | Set | `recipient`, `lookbackDays=30`, `hashtags[]` (the five tracked tags, read by Build request). |
| **Apify - Instagram** | HTTP Request | `apify~instagram-hashtag-scraper` run-sync; `Execute Once`, `memory=4096`, `resultsLimit=12`. |
| **Apify - TikTok** | HTTP Request | `clockworks~tiktok-scraper` run-sync; `Execute Once`, `memory=4096`, `resultsPerPage=12`. |
| **Apify - Hashtag stats** | HTTP Request | `apify~instagram-hashtag-analytics-scraper` run-sync; `Execute Once`; `includeLatestPosts`/`includeTopPosts` **false** (only `postsCount` is needed — cheaper and faster). |
| **Build request** | Code | See [build-request-node](/project/build-request-node.md). |
| **AI - Meetapedia router** | HTTP Request | POST `meetapedia.com/v1/chat/completions`, `model: 'auto'`, **text-only**. Retries 3× / 5 s, because free-tier 429s are ordinary. See [meetapedia-router](/tech/meetapedia-router.md). |
| **DeepSeek** | HTTP Request | **Disabled standby**, unwired since 2026-08-18. Kept with its credential so the paid path is a two-click rollback — see [deepseek-api](/tech/deepseek-api.md). |
| **Parse response** | Code | See [parse-response-node](/project/parse-response-node.md) — validate, score, sort, render HTML. |
| **Has picks?** | IF | `{{ $json.picks.length }} > 0`; false → no email. |
| **Gmail - send digest** | Gmail | To the configured recipient, HTML `{{ $json.html }}`; n8n attribution OFF. |
| **Split picks** | Code | One item per pick → dedup rows (`url, platform, creator, activity, sent_date`). |
| **Insert row** | Data Table | Append picks to [dedup table](/project/dedup-datatable.md). |
| **Split counts** | Code | One item per hashtag → `{hashtag, posts_count, checked_date}`. |
| **Insert count row** | Data Table | Append today's totals to [hashtag counts](/project/hashtag-counts-datatable.md). |
| **Get sent** | Data Table | Read all sent URLs. **In line, `Execute Once`**, ahead of Build request. |
| **Get counts** | Data Table | Read all hashtag counts. **In line, `Execute Once`**, ahead of Build request. |

## Why the counts branch bypasses `Has picks?`

**Split counts / Insert count row** hang off **Build request**, not off the Gmail path. Today's totals
must be recorded even on days when nothing qualifies and no email is sent — otherwise the next day's
delta silently breaks. See [hashtag-counts-datatable](/project/hashtag-counts-datatable.md).

## Why the Apify nodes are `Execute Once`

Without it, a downstream HTTP node fires once **per input item** (40 Instagram items → 40 concurrent
Apify runs), which exhausted memory and credit. `Execute Once` runs each Apify actor a single time.
This applies to all three Apify nodes. See [decisions](/project/decisions.md) and [apify](/tech/apify.md).

## Data shapes

- Apify → normalized candidate: `{platform, url, text, likes, comments, date, image, location, hashtags}`.
- Apify hashtag stats → `{hashtag, postsCount}` per configured hashtag.
- Model → `{picks:[{index, line, csoportos, oktatos, felnott}]}` (validated, not schema-enforced), inside the OpenAI response envelope plus the router's additive `x_router` provenance field.
- Parse → `{picks:[…], html, runDate, candidateCount, hashtagStats}`.
