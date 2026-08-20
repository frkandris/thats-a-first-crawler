---
type: Spec
title: Email item format
description: The exact per-item HTML layout of the digest email.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [email, html, format, hungarian]
timestamp: 2026-08-20T00:00:00Z
---

The digest is minimalist: **no header**, **not bold**, one numbered paragraph per pick — and nothing
else since the hashtag delta block was removed on 2026-08-20. Rendered by
[parse-response-node](/project/parse-response-node.md). Subject: `[that's a first] YYYY-MM-DD`.

## Per-item structure

```
{N}. {descriptive line} (platform link)
     {hashtags, grey, small}
     {small image}
```

Rules:
- **Number** each item from 1.
- The line starts with the **activity** (a noun), never with "Először"/"Első"/"first".
- Segments joined by " - ": `{activity, with location if any} - {social context} [- teacher] [- social proof]`.
- **Social context always present**: `egyedül` / `ketten` / `társasággal` / `csoportosan` / `oktatóval`.
- **No platform name in the text** and **no people's names**; the platform appears only as the clickable link.
- Accented Hungarian throughout.
- Hashtags on their own line (grey `#888`, 13px); image `max-width:180px`.

## Example (rendered)

> 1. Hadzs zarándoklat, Szaúd-Arábia (Mekka és Medina) - csoportosan - 166 like, 3 komment (Instagram)
> `#hajj2026 #newexperiences …`
> *[group photo]*

## HTML template

```html
<p style="margin:0 0 20px 0">{N}. {line} (<a href="{url}">{platform}</a>)
<br><span style="color:#888;font-size:13px">{hashtags}</span>
<br><img src="{imageUrl}" alt="" style="max-width:180px;border-radius:8px;display:block;margin:8px 0"></p>
```

The `<span>` and `<img>` (with their `<br>`) are emitted only when hashtags / image exist.

# Citations

- [ranking-algorithm](/project/ranking-algorithm.md) determines the order of items.
- [decisions](/project/decisions.md) records why the format evolved (accents, activity-first, no footer,
  and why the hashtag delta block was removed on 2026-08-20).
