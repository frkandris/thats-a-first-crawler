---
type: Project
title: That's a First Digest
description: A daily n8n workflow that scrapes Instagram/TikTok and emails a Hungarian digest of people trying something for the first time.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [project, n8n, digest, strt]
timestamp: 2026-07-04T00:00:00Z
---

**That's a First Digest** is an [n8n](/tech/n8n.md) workflow. Every morning it discovers recent
public social posts where someone tries something for the **first time**, ranks them, and emails a
compact **Hungarian** digest to a configured recipient.

Discovery is done with [Apify](/tech/apify.md) hashtag scrapers (not web search); assembly and
ranking with one [Claude vision](/tech/claude-vision-api.md) call; delivery via the n8n Gmail node.

- **Owner:** STRT
- **Recipient & sender:** configured in the Config node and the Gmail credential
- **Schedule:** daily **06:00** Europe/Berlin — see [runbook](/project/runbook.md)
- **Status:** published / active (2026-07-04)
- **Subject line:** `[that's a first] YYYY-MM-DD`
- **Discovery hashtags:** `#thatsafirst` and relatives (`tryingnewthings`, `tryingsomethingnew`,
  `newexperience`, `newexperiences`)

## How it works

See [pipeline](/project/pipeline.md) for the full node chain. In short:
Apify scrapes IG + TikTok → [build-request-node](/project/build-request-node.md) normalizes candidates,
downloads their images as base64, and assembles a Claude request → Claude selects ≤5 posts and
extracts ranking parameters from text **and image** → [parse-claude-node](/project/parse-claude-node.md)
scores, sorts, and renders the [email](/project/email-format.md) → Gmail sends → the picks are written
to the [dedup table](/project/dedup-datatable.md) so they never repeat.

## Requirements captured

- Genuine first-time experiences only; up to 5 per day; skip if fewer good ones.
- Minimalist email: no loud header, not bold, numbered items, hashtags under each item, small image.
- Activity-first descriptions (never start with "Először"/"first"); accented Hungarian; no people's names.
- Ranking preferences realized in [ranking-algorithm](/project/ranking-algorithm.md).

## See also

[decisions](/project/decisions.md) · [credentials](/project/credentials.md) · [runbook](/project/runbook.md)
