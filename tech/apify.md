---
type: Tool
title: Apify
description: The scraping platform whose Instagram and TikTok hashtag actors provide the candidate posts.
resource: https://apify.com
tags: [apify, scraping, instagram, tiktok]
timestamp: 2026-07-04T00:00:00Z
---

[Apify](https://apify.com) runs hosted scrapers ("actors"). The digest calls two via the
**run-sync-get-dataset-items** endpoint from [n8n](/tech/n8n.md) HTTP nodes.

## Actors

| Node | Actor | Key output fields |
|---|---|---|
| Apify - Instagram | `apify~instagram-hashtag-scraper` | `url`/`shortCode`, `caption`, `likesCount`, `commentsCount`, `timestamp`, `displayUrl`, `locationName`, `hashtags` |
| Apify - TikTok | `clockworks~tiktok-scraper` | `webVideoUrl`, `text`, `diggCount`, `commentCount`, `createTimeISO`, `videoMeta.coverUrl`, `hashtags[].name` |

These map to the normalized candidate in [build-request-node](/project/build-request-node.md).

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
