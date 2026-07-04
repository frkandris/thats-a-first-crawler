---
type: Tool
title: wsrv.nl image proxy
description: A free image CDN/proxy used to make Instagram/TikTok CDN images render in email.
resource: https://wsrv.nl
tags: [images, proxy, cdn, email]
timestamp: 2026-07-04T00:00:00Z
---

[wsrv.nl](https://wsrv.nl) (formerly images.weserv.nl) fetches a source image server-side and re-serves
a clean, cacheable, resizable copy.

## Why the digest needs it

Instagram/TikTok CDN images are **hotlink-protected**: pasted raw into an HTML email they do not render
(Gmail's image proxy is blocked). Routing them through wsrv makes them render, and the `w` param gives
consistent sizing.

## Usage

```
https://wsrv.nl/?url=<url-encoded source>&w=360&output=jpg
```

- Used as the `imageUrl` in the [email](/project/email-format.md) (displayed at `max-width:180px`).
- Built in [build-request-node](/project/build-request-node.md)'s `proxy()` helper.

## Caveat

wsrv is used for **email display**. It is **not** a valid image source for
[Claude vision](/tech/claude-vision-api.md) — Anthropic still refuses it on robots.txt grounds, which is
why images are downloaded and sent as base64. See [decisions](/project/decisions.md#images).
