---
type: Spec
title: Email item format
description: The exact per-item HTML layout of the digest email, plus the hashtag delta block at the end.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [email, html, format, hungarian, hashtags]
timestamp: 2026-08-07T00:00:00Z
---

The digest is minimalist: **no header**, **not bold**, one numbered paragraph per pick, followed by the
[hashtag delta block](#hashtag-delta). Rendered by
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

## <a id="hashtag-delta"></a>Hashtag delta block

Appended **after** the numbered items, separated by a hairline rule. It answers "how many new posts
appeared under each tracked hashtag since the previous run", computed as the day-over-day difference of
each hashtag's total post count — see
[hashtag-counts-datatable](/project/hashtag-counts-datatable.md).

```
─────────────────────────
Új poszt tegnap óta:
#thatsafirst          1 284
#tryingnewthings        417
#tryingsomethingnew     206
#newexperience          — (első mérés)
#newexperiences         892 (3 nap alatt)
```

Rules:
- Hungarian thousands separator: **non-breaking space** (`1 284`), not a comma.
- Sorted by delta descending; hashtags with no comparable previous row go last.
- No previous row → `— (első mérés)`; gap larger than one day → the delta plus `(N nap alatt)`.
- Clamped at `0`; a decrease renders as `—`.
- **Instagram only.** The TikTok actor exposes no hashtag-level total, so the block is labelled as an
  Instagram figure and TikTok is not included. See [apify](/tech/apify.md#analytics).

```html
<hr style="border:0;border-top:1px solid #eee;margin:28px 0 14px 0">
<p style="margin:0;color:#888;font-size:13px">Új poszt tegnap óta (Instagram):</p>
<table style="border-collapse:collapse;font-size:13px;color:#888;margin-top:6px">
  <tr><td style="padding:2px 12px 2px 0">#{hashtag}</td>
      <td style="padding:2px 0;text-align:right">{delta}{note}</td></tr>
</table>
```

The block is emitted **only when at least one hashtag has a comparable previous row**; on the very first
run it is omitted entirely rather than printing a table of dashes.

# Citations

- [ranking-algorithm](/project/ranking-algorithm.md) determines the order of items.
- [decisions](/project/decisions.md) records why the format evolved (accents, activity-first, no footer,
  hashtag delta).
