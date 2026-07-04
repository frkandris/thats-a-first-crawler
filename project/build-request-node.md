---
type: Code Node
title: Build request node
description: Normalizes IG/TikTok candidates, filters and dedups, downloads images as base64, and assembles the Claude vision request.
resource: https://n8n.strt.hu/workflow/JEHhYDEEklYRoIHb
tags: [code, n8n, claude, vision, base64]
timestamp: 2026-07-04T00:00:00Z
---

An [n8n](/tech/n8n.md) Code node ("Run Once for All Items"). It turns raw
[Apify](/tech/apify.md) output into a [Claude](/tech/claude-vision-api.md) request body.

## Steps

1. **Normalize** IG and TikTok items into `{platform, url, text, likes, comments, date, image, location, hashtags}`.
   - `image` is a [wsrv.nl](/tech/wsrv-image-proxy.md) proxied URL (`w=360&output=jpg`).
2. **Filter** to the last `lookbackDays` (**30**) and drop URLs already sent — comparing **canonicalized**
   URLs (`canon()`: lowercase, strip query/fragment, `reel|reels|tv` → `p`, drop trailing slash) against
   [Get sent](/project/dedup-datatable.md). Within-run duplicates are dropped too.
3. **Rank candidates for analysis**: first the ones whose caption matches genuine first-time signals
   (`first time`, `day one`, `először`, `learning to`, …), then by engagement; keep the top **30**.
   Each Apify actor returns **50 per hashtag** (`resultsLimit`/`resultsPerPage=50`), so the pool is large.
4. **Download images as base64** — for each candidate:
   ```js
   const bin = await this.helpers.httpRequest({ url: cands[i].image, encoding: 'arraybuffer', timeout: 15000 });
   cands[i].b64 = Buffer.from(bin).toString('base64');
   ```
   Anthropic refuses URL image sources blocked by robots.txt, so we send bytes. See
   [decisions](/project/decisions.md#images).
5. **Assemble** the Messages request: a text block listing candidates by `[index]`, then one
   `{type:'image', source:{type:'base64', media_type:'image/jpeg', data:…}}` block per candidate.
6. **Output** `{ body, runDate, candidateCount, cands }` — `cands` (without base64) is read back by
   [parse-claude-node](/project/parse-claude-node.md) to look up url/image/hashtags by index.

## Prompt (system)

Accented Hungarian; **positive** activity-first examples only (negative "Először" examples caused the
model to copy them). Asks Claude to select ≤5 real first-time posts and, per pick, return
`index, line` and the ranking params (`csoportos, oktatos, felnott, kepTipus, ratirtSzoveg`).
See [ranking-algorithm](/project/ranking-algorithm.md) and [email-format](/project/email-format.md).

## Structured output schema

`output_config.format = { type: 'json_schema', schema }` where `schema.picks[]` requires
`index, line, csoportos, oktatos, felnott, kepTipus(enum), ratirtSzoveg`.

## Gotchas

- `this.helpers.httpRequest` + top-level `await` work in the Code node (n8n wraps it in an async fn);
  plain `node --check` rejects the top-level await — validate wrapped.
- Keep base64 out of the returned `cands` to keep run state small.
