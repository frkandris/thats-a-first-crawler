---
type: Pipeline
title: Workflow pipeline
description: The n8n node chain and data flow of That's a First Digest, node by node.
resource: https://n8n.strt.hu/workflow/JEHhYDEEklYRoIHb
tags: [pipeline, n8n, dataflow]
timestamp: 2026-07-04T00:00:00Z
---

The [project](/project/thats-a-first-digest.md) is a single [n8n](/tech/n8n.md) workflow
(id `JEHhYDEEklYRoIHb`). Two branches leave **Config**: the main scrape/assemble/send chain, and a
parallel read of the [dedup table](/project/dedup-datatable.md).

## Node chain

```
Schedule (06:00) → Config ─┬─► Apify Instagram ─► Apify TikTok ─► Build request ─► Claude
                           │        ►  Parse Claude ─► Has picks? ─(true)─► Gmail send ─► Split picks ─► Insert row
                           └─► Get sent  (parallel; read by Build request via $('Get sent'))
```

| Node | Type | Role |
|---|---|---|
| **Every day 06:00** | Schedule Trigger | Fires daily 06:00 Europe/Berlin. |
| **Config** | Set | `recipient`, `lookbackDays=30`. |
| **Apify - Instagram** | HTTP Request | `apify~instagram-hashtag-scraper` run-sync; `Execute Once`, `memory=4096`, `resultsLimit=50`. |
| **Apify - TikTok** | HTTP Request | `clockworks~tiktok-scraper` run-sync; `Execute Once`, `memory=4096`, `resultsPerPage=50`. |
| **Build request** | Code | See [build-request-node](/project/build-request-node.md). |
| **Claude** | HTTP Request | POST `api.anthropic.com/v1/messages`, model `claude-opus-4-8`, vision + structured output. |
| **Parse Claude** | Code | See [parse-claude-node](/project/parse-claude-node.md) — score, sort, render HTML. |
| **Has picks?** | IF | `{{ $json.picks.length }} > 0`; false → no email. |
| **Gmail - send digest** | Gmail | To `andris@strt.hu`, HTML `{{ $json.html }}`; n8n attribution OFF. |
| **Split picks** | Code | One item per pick → dedup rows (`url, platform, creator, activity, sent_date`). |
| **Insert row** | Data Table | Append picks to [dedup table](/project/dedup-datatable.md). |
| **Get sent** | Data Table | Read all sent URLs (parallel branch), referenced by Build request. |

## Why the two Apify nodes are `Execute Once`

Without it, the TikTok HTTP node fires once **per input item** (40 Instagram items → 40 concurrent
Apify runs), which exhausted memory and credit. `Execute Once` runs each Apify actor a single time.
See [decisions](/project/decisions.md) and [apify](/tech/apify.md).

## Data shapes

- Apify → normalized candidate: `{platform, url, text, likes, comments, date, image, location, hashtags}`.
- Claude → `{picks:[{index, line, csoportos, oktatos, felnott, kepTipus, ratirtSzoveg}]}`.
- Parse → `{picks:[…], html, runDate, candidateCount}`.
