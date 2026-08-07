---
type: Code Node
title: Build request node
description: Normalizes IG/TikTok candidates, filters and dedups, computes the hashtag deltas, and assembles the text-only DeepSeek request.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [code, n8n, deepseek, hashtags]
timestamp: 2026-08-07T00:00:00Z
---

An [n8n](/tech/n8n.md) Code node ("Run Once for All Items"). It turns raw
[Apify](/tech/apify.md) output into a [DeepSeek](/tech/deepseek-api.md) chat request body.

## Steps

1. **Normalize** IG and TikTok items into `{platform, url, text, likes, comments, date, image, location, hashtags}`.
   - `image` is a [wsrv.nl](/tech/wsrv-image-proxy.md) proxied URL (`w=360&output=jpg`). It is carried
     **only for email rendering** — the model never sees it.
2. **Filter** to the last `lookbackDays` (**30**) and drop URLs already sent — comparing **canonicalized**
   URLs (`canon()`: lowercase, strip query/fragment, `reel|reels|tv` → `p`, drop trailing slash) against
   [Get sent](/project/dedup-datatable.md). Within-run duplicates are dropped too.
3. **Rank candidates for analysis**: first the ones whose caption matches genuine first-time signals
   (`first time`, `day one`, `először`, `learning to`, …), then by engagement; keep the top **30**.
   Each Apify actor returns **12 per hashtag** (`resultsLimit`/`resultsPerPage=12`) — tuned to a cost
   target; see [decisions](/project/decisions.md).
4. **Compute hashtag deltas** from **Apify - Hashtag stats** and `$('Get counts')`: for each configured
   hashtag take today's `postsCount`, find the most recent stored row with `checked_date < runDate`, and
   emit `{hashtag, postsCount, delta, spanDays, first}`. Negative deltas are clamped to `0`. See
   [hashtag-counts-datatable](/project/hashtag-counts-datatable.md).
5. **Assemble** the Messages request: a `system` message (accented Hungarian instructions **plus a literal
   JSON example**) and a `user` message listing candidates by `[index]` with caption, engagement, date and
   location. Text only — no image blocks.
6. **Output** `{ body, runDate, candidateCount, cands, hashtagStats }` — `cands` is read back by
   [parse-response-node](/project/parse-response-node.md) to look up url/image/hashtags by index, and
   `hashtagStats` feeds both the email block and the **Split counts** branch.

## Prompt (system)

Accented Hungarian; **positive** activity-first examples only (negative "Először" examples caused the
model to copy them). Asks the model to select ≤5 real first-time posts and, per pick, return
`index, line` and the ranking params (`csoportos, oktatos, felnott`).
See [ranking-algorithm](/project/ranking-algorithm.md) and [email-format](/project/email-format.md).

## JSON output is prompt-enforced, not schema-enforced

[DeepSeek](/tech/deepseek-api.md) supports only `response_format: {"type":"json_object"}` — there is no
JSON Schema. Therefore:

- The system prompt **must contain the word "json"** and a literal example of the target object:
  `{"picks":[{"index":0,"line":"…","csoportos":true,"oktatos":false,"felnott":true}]}`.
- `max_tokens` is set to **4000** so the object cannot be truncated mid-string.
- All validation happens downstream in [parse-response-node](/project/parse-response-node.md).

## Gotchas

- `this.helpers.httpRequest` and top-level `await` work in the Code node (n8n wraps it in an async fn);
  plain `node --check` rejects the top-level await — validate wrapped. Still relevant for the hashtag
  branch, though the image downloads that originally needed it are gone.
- Keep `cands` small — it is carried through run state to the parse node.
- The hashtag keys are compared **lowercased and without `#`** on both sides; Apify returns them
  inconsistently cased.
