---
type: Tool
title: Apify
description: The scraping platform whose Instagram and TikTok hashtag actors provide the candidate posts.
resource: https://apify.com
tags: [apify, scraping, instagram, tiktok, hashtags]
timestamp: 2026-08-07T00:00:00Z
---

[Apify](https://apify.com) runs hosted scrapers ("actors"). The digest calls two via the
**run-sync-get-dataset-items** endpoint from [n8n](/tech/n8n.md) HTTP nodes.

## Actors

| Node | Actor | Key output fields |
|---|---|---|
| Apify - Instagram | `apify~instagram-hashtag-scraper` | `url`/`shortCode`, `caption`, `likesCount`, `commentsCount`, `timestamp`, `displayUrl`, `locationName`, `hashtags` |
| Apify - TikTok | `clockworks~tiktok-scraper` | `webVideoUrl`, `text`, `diggCount`, `commentCount`, `createTimeISO`, `videoMeta.coverUrl`, `hashtags[].name` |
| Apify - Hashtag stats | `apify~instagram-hashtag-analytics-scraper` | `postsCount`, `postsPerDay`, `topPosts`, `latestPosts`, `related` |

The first two map to the normalized candidate in [build-request-node](/project/build-request-node.md).

## <a id="analytics"></a>Hashtag-level totals

The two post scrapers return **only individual post records** — there is no `postsCount` or other
hashtag-level aggregate in their output. The separate **`apify~instagram-hashtag-analytics-scraper`**
does return the hashtag's lifetime `postsCount`, which is what the
[hashtag delta block](/project/email-format.md#hashtag-delta) is built from.

- Pricing is **pay-per-event**, from **$1.40 / 1,000 results**. One result per hashtag per day ×
  5 hashtags ≈ **$0.007/run ≈ $0.21/month** — negligible next to the post scrapers.
- The actor also reports `postsPerDay`, but that is Apify's own estimate. The digest instead stores
  `postsCount` daily and computes its own difference, so the number is auditable and matches our
  schedule exactly. See [hashtag-counts-datatable](/project/hashtag-counts-datatable.md).
- **Instagram only.** `clockworks~tiktok-scraper` exposes no equivalent hashtag total, so the delta block
  is Instagram-only.

## Endpoint

```
POST https://api.apify.com/v2/acts/<actor>/run-sync-get-dataset-items?memory=4096
Authorization: Bearer <APIFY_TOKEN>
```

`memory=4096` caps per-run memory. Auth via the "Apify header" credential
([credentials](/project/credentials.md)).

## Plan limits (learned)

- The **free** plan (16 GB / $5 credit) could **not** launch the TikTok actor once credit ran low; a
  bug where TikTok ran once per input item burned ~$4. Fixes: `Execute Once` on both nodes, `memory=4096`,
  and a **paid** subscription (activated 2026-07-04). See [decisions](/project/decisions.md).
