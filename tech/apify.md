---
type: Tool
title: Apify
description: The scraping platform whose Instagram and TikTok hashtag actors provide the candidate posts.
resource: https://apify.com
tags: [apify, scraping, instagram, tiktok, hashtags]
timestamp: 2026-08-20T00:00:00Z
---

[Apify](https://apify.com) runs hosted scrapers ("actors"). The digest calls two via the
**run-sync-get-dataset-items** endpoint from [n8n](/tech/n8n.md) HTTP nodes.

## Actors

| Node | Actor | Key output fields |
|---|---|---|
| Apify - Instagram | `apify~instagram-hashtag-scraper` | `url`/`shortCode`, `caption`, `likesCount`, `commentsCount`, `timestamp`, `displayUrl`, `locationName`, `hashtags` |
| Apify - TikTok | `clockworks~tiktok-scraper` | `webVideoUrl`, `text`, `diggCount`, `commentCount`, `createTimeISO`, `videoMeta.coverUrl`, `hashtags[].name` |

The first two map to the normalized candidate in [build-request-node](/project/build-request-node.md).

## <a id="analytics"></a>Hashtag-level totals — retired 2026-08-20

The post scrapers return **individual posts**, never a hashtag-level aggregate. The separate
**`apify~instagram-hashtag-analytics-scraper`** does return a lifetime `postsCount`, and the digest used
it for a daily delta block until 2026-08-20.

**It was retired because the number never changes.** Thirteen days of stored measurements across five
hashtags produced zero movement, and the actor's own output shows why it should not be trusted anyway:
`postsCount` is **100× too large for `K`-scale tags** (`4094000` alongside its own `posts: "40.94 K"`),
while `M`-scale tags convert correctly; `postsPerDay` comes back empty. All alternatives in the store read
the same Instagram page, which publishes a rounded figure, so swapping actors would not help. Full
evidence: [decisions](/project/decisions.md#drop-hashtag-counts).

**Cost note for the record:** it was pay-per-event, ~$0.007/run ≈ $0.21/month — cheap, but it bought
nothing.

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
