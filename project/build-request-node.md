---
type: Code Node
title: Build request node
description: Normalizes IG/TikTok candidates, filters and dedups, and assembles the text-only chat request sent to Groq.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [code, n8n, llm, dedup]
timestamp: 2026-08-19T00:00:00Z
---

An [n8n](/tech/n8n.md) Code node ("Run Once for All Items"). It turns raw
[Apify](/tech/apify.md) output into an OpenAI-shaped chat request body for
[Groq](/tech/groq.md).

## Steps

1. **Normalize** IG and TikTok items into `{platform, url, text, likes, comments, date, image, location, hashtags}`.
   - `image` is a [wsrv.nl](/tech/wsrv-image-proxy.md) proxied URL (`w=360&output=jpg`). It is carried
     **only for email rendering** — the model never sees it.
2. **Filter** to the last `lookbackDays` (**30**) and drop URLs already sent — comparing **canonicalized**
   URLs (`canon()`: lowercase, strip query/fragment, `reel|reels|tv` → `p`, drop trailing slash) against
   [Get sent](/project/dedup-datatable.md). Within-run duplicates are dropped too.
   **`Get sent` must be an ancestor of this node** — it is wired in line for exactly this reason. `$('Get sent')` is *not* wrapped in a swallowing `try/catch`: it throws a named error if
   the node has not executed, because an empty read used to look identical to "nothing sent yet" and
   [disabled dedup silently](/project/dedup-datatable.md#silent-failure).
3. **Rank candidates for analysis**: first the ones whose caption matches genuine first-time signals
   (`first time`, `day one`, `először`, `learning to`, …), then by engagement; keep the top **30**.
   Each Apify actor returns **12 per hashtag** (`resultsLimit`/`resultsPerPage=12`) — tuned to a cost
   target; see [decisions](/project/decisions.md).
4. **Assemble** the Messages request: a `system` message (accented Hungarian instructions **plus a literal
   JSON example**) and a `user` message listing candidates by `[index]` with caption, engagement, date and
   location. Text only — no image blocks.
5. **Output** `{ body, runDate, candidateCount, cands, sentRowCount }` — `sentRowCount` exists purely as
   a diagnostic, so a zero-row dedup read is visible in the run data. `cands` is read back by
   [parse-response-node](/project/parse-response-node.md) to look up url/image/hashtags by index.

## Prompt (system)

Accented Hungarian; **positive** activity-first examples only (negative "Először" examples caused the
model to copy them). Asks the model to select ≤5 real first-time posts and, per pick, return
`index, line` and the ranking params (`csoportos, oktatos, felnott`).
See [ranking-algorithm](/project/ranking-algorithm.md) and [email-format](/project/email-format.md).

## The request body

```js
model: 'openai/gpt-oss-120b',
max_tokens: 3000,
reasoning_effort: 'low',
stream: false,
response_format: { type: 'json_object' },
```

- **`model: 'openai/gpt-oss-120b'`** — chosen by measurement against the real 30-candidate request, not
  by leaderboard: the 20b is faster and scores higher elsewhere but drifts out of Hungarian and drops the
  line format; qwen fails JSON mode outright ([groq](/tech/groq.md)).
- **`max_tokens: 3000`.** Groq's free tier bills `prompt + max_tokens` against **one 8000 TPM window,
  before generating**, so the ceiling is not free headroom — `max_tokens: 8000` was a flat `413`. Size it
  against the **worst case this node can produce**: 30 candidates × 300-char captions ≈ 4600 tokens, so
  4000 would have failed on a long-caption day, and did not only because the observed prompt was 3400.
  A [test](/format/engineering-practices.md) now asserts the arithmetic. It doubles as the reasoning
  budget, which is what an empty answer costs when it runs out
  ([deepseek-api](/tech/deepseek-api.md#thinking)). Measured completion: 805 tokens.
- **`reasoning_effort: 'low'`** — `medium` spent 60% more tokens and returned *worse* picks (a duplicate
  activity and a self-contradicting line). Selection against explicit criteria does not reward
  deliberation.

## JSON output is prompt-enforced, not schema-enforced

Groq honours `response_format: {"type":"json_object"}` but offers **no JSON Schema**, so the shape is
still the prompt's job. Therefore:

- The system prompt **must contain the word "json"** and a literal example of the target object:
  `{"picks":[{"index":0,"line":"…","csoportos":true,"oktatos":false,"felnott":true}]}`. It is what keeps
  the model's output shape stable across a model change — it survived Claude → DeepSeek → gpt-oss.
- All validation happens downstream in [parse-response-node](/project/parse-response-node.md), which also
  strips a markdown fence before parsing.

## Gotchas

- `this.helpers.httpRequest` and top-level `await` work in the Code node (n8n wraps it in an async fn);
  plain `node --check` rejects the top-level await — `scripts/check.sh` wraps before checking.
- Keep `cands` small — it is carried through run state to the parse node.
- Candidate hashtags are carried as a display string for the email only; nothing keys off them since the
  [counts feature was removed](/project/decisions.md#drop-hashtag-counts).
