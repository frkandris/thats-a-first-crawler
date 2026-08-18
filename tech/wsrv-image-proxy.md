---
type: Tool
title: wsrv.nl image proxy
description: A free image CDN/proxy used to make Instagram/TikTok CDN images render in email.
resource: https://wsrv.nl
tags: [images, proxy, cdn, email]
timestamp: 2026-08-18T00:00:00Z
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

## Scope

wsrv is used for **email display only** — it is the last remaining image concern in the pipeline.
Since the 2026-08-07 switch to a text-only model call, no image is sent to any model, so the old
base64-download workaround (and the robots.txt problem that forced it) is gone. The 2026-08-18 move from
[DeepSeek](/tech/deepseek-api.md) to the [router](/tech/meetapedia-router.md) did not change this: the
request is still text-only, and several free models could not accept images anyway.
See [decisions](/project/decisions.md#deepseek).
