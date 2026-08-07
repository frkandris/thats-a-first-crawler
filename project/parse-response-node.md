---
type: Code Node
title: Parse response node
description: Validates the DeepSeek JSON response, scores and sorts the picks deterministically, and renders the email HTML including the hashtag delta block.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [code, n8n, ranking, html, deepseek]
timestamp: 2026-08-07T00:00:00Z
---

An [n8n](/tech/n8n.md) Code node after the [DeepSeek](/tech/deepseek-api.md) HTTP node. It owns the
[ranking](/project/ranking-algorithm.md) and the [email rendering](/project/email-format.md).
Named **Parse response** (it was "Parse Claude" until the 2026-08-07 model switch).

## Steps

1. **Parse** `choices[0].message.content` → `JSON.parse` → `{picks:[…]}`.
2. **Validate** — the model output is *not* schema-enforced (see below). Drop malformed picks.
3. **Enrich** each pick: look up `cands[pick.index]` from
   [build-request-node](/project/build-request-node.md) (via `$('Build request').first().json.cands`)
   to recover `url, platform, image (proxied), hashtags, engagement`.
4. **Score** with the formula in [ranking-algorithm](/project/ranking-algorithm.md); dedupe by url
   (keep highest score).
5. **Sort** by score desc, tie-break engagement desc; take top 5.
6. **Render** the numbered HTML per [email-format](/project/email-format.md), followed by the
   [hashtag delta block](/project/email-format.md#hashtag-delta) built from `hashtagStats`.
7. **Output** `{ picks, html, runDate, candidateCount, hashtagStats }`.
   - `picks` is consumed by **Split picks** → [dedup table](/project/dedup-datatable.md)
     (`activity` column = `pick.line`).
   - `html` is consumed by the Gmail node.
   - `hashtagStats` is consumed by **Split counts** → [hashtag counts](/project/hashtag-counts-datatable.md).

## Validation rules (why this step exists)

DeepSeek's JSON mode guarantees *syntactically valid JSON*, **not** our shape — and its docs admit the
API "may occasionally return empty content". So the node defends explicitly:

| Check | Action on failure |
|---|---|
| Response content empty / not parseable JSON | Treat as `{picks:[]}` — **Has picks?** stops the run, no email. Never throw. |
| `picks` missing or not an array | Same as above. |
| `index` not an integer within `0…cands.length-1` | Drop that pick. |
| `line` missing or empty string | Drop that pick. |
| `csoportos` / `oktatos` / `felnott` not boolean | Coerce truthy → boolean; absent → `false`. |
| More than 5 picks returned | Score all, keep the top 5. |

An empty result is a **normal outcome**, not an error: some days nothing genuine qualifies.

## Notes

- `line` from the model carries the description **without** the platform; the platform link is appended
  here so the clickable-link rule is guaranteed in code.
- If `picks.length === 0`, **Has picks?** stops the run and no email is sent — but the
  [hashtag counts](/project/hashtag-counts-datatable.md) are still written, because that branch does not
  pass through **Has picks?**. See [pipeline](/project/pipeline.md).
- The picks no longer carry `kepTipus` / `ratirtSzoveg`; those were image-derived and were removed with
  the vision call. See [ranking-algorithm](/project/ranking-algorithm.md).
