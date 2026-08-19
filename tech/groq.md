---
type: Tool
title: Groq API
description: The free-tier OpenAI-compatible inference API that runs the digest's daily selection call, and the tokens-per-minute limit that shapes the request.
resource: https://console.groq.com/docs
tags: [groq, api, llm, free-tier, json-mode, tpm]
timestamp: 2026-08-19T00:00:00Z
---

Selection + parameter extraction is **one text-only chat call** to Groq, on **our own free-tier key**,
assembled by [build-request-node](/project/build-request-node.md) and parsed by
[parse-response-node](/project/parse-response-node.md). It replaced the shared
[Meetapedia router](/tech/meetapedia-router.md) on **2026-08-19** — see
[decisions](/project/decisions.md#own-groq-key).

## Request shape

```
POST https://api.groq.com/openai/v1/chat/completions
Authorization: Bearer <GROQ_API_KEY>

{
  "model": "openai/gpt-oss-120b",
  "max_tokens": 3000,
  "reasoning_effort": "low",
  "stream": false,
  "response_format": {"type": "json_object"},
  "messages": [ {"role":"system", …}, {"role":"user", …} ]
}
```

## <a id="tpm"></a>The limit is tokens-per-minute, and `max_tokens` counts against it

The free tier's binding constraint is **8000 tokens per minute**, not a request count — and Groq charges
the window **`prompt_tokens + max_tokens`, before generating anything**. So an oversized ceiling is not a
harmless safety margin; it is an instant rejection:

```
HTTP 413  "Request too large … on tokens per minute (TPM):
           Limit 8000, Requested 8456"
```

That was the digest's own request with the inherited `max_tokens: 8000` — 456 tokens of prompt in a
trimmed test, and the ceiling alone blew the window.

**Size it against the worst case the node can produce, not the prompt you happened to measure.** The
observed request was ~3400 tokens, but [build-request-node](/project/build-request-node.md) sends up to
30 candidates with captions truncated at 300 characters, so the ceiling it can reach is ~4600:

```
3398 (observed prompt) + 3000 = 6398   ✅
4571 (worst case)      + 3000 = 7571   ✅  headroom: 429 tokens
4571                   + 4000 = 8571   ❌  413 on any long-caption day
3398                   + 8000 = 11398  ❌  413, every time
```

`max_tokens: 4000` shipped first and would have passed for days before failing on a slow news morning
with chatty captions. The worst case is computed and asserted in `tests/build-request.test.mjs`; that
test is what found it. Measured completion: **805 tokens**, well under the 3000 cap.

**A 413 is not retryable in any useful sense** (the node's 3 retries send the identical oversized body).
If the candidate list ever grows — more hashtags, longer captions — the prompt grows with it and the
ceiling must come down, or the request will start failing outright rather than degrading.

## Model choice, measured on the real request

Benchmarked 2026-08-19 against the **actual 30-candidate body** pulled from that morning's failed run,
not a synthetic prompt:

| model | max_tokens / effort | latency | completion | outcome |
|---|---|---|---|---|
| **`openai/gpt-oss-120b`** | 4000 / `low` | **2.0 s** | 805 | 4 picks, Hungarian line format intact, accents and engagement suffix correct (shipped at 3000 — see above) |
| `openai/gpt-oss-20b` | 4000 / `low` | 0.9 s | 408 | 4 picks, but the language drifts — `"Mushroom coffee first cup"`, the invented word `"Lovasmenetés"`, and the `- N like, N komment` suffix dropped |
| `qwen/qwen3.6-27b` | 4000 / — | 8.6 s | — | **`json_validate_failed`** — cannot hold `response_format: json_object` on this prompt |
| `openai/gpt-oss-120b` | 4600 / `medium` | 3.1 s | 1296 | 4 picks, but returned the same activity twice and one self-contradicting line (`"Pilates - egyedül - oktatóval"`) |

Two results worth keeping:

- **Size beats speed here.** The 20b is twice as fast and half the tokens, and it is the model the
  Meetapedia catalogue scores *higher* (67 vs 62) — but that score measures English extraction. On a
  Hungarian judgement call with a strict output format, the 120b is the one that holds the format.
- **`low` beat `medium`.** More reasoning produced *worse* picks, not better, on top of 60% more tokens.
  The task is selection against explicit criteria, not a problem that rewards deliberation.

`groq/compound`, the whisper and guard models are unrelated to this task; the catalogue is otherwise
`gpt-oss-120b`, `gpt-oss-20b`, `gpt-oss-safeguard-20b`, `qwen3.6-27b` (read 2026-08-19).

## JSON mode

Groq honours `response_format: {"type": "json_object"}` and **rejects the request outright** when the
model cannot produce valid JSON (`json_validate_failed`, as qwen did) rather than returning prose. No
fenced answers were observed from the gpt-oss models, so
[`jsonSlice`](/project/parse-response-node.md#jsonslice) is now belt-and-braces rather than load-bearing —
keep it: it costs nothing and the model catalogue moves.

## Model names move

Groq deprecated `llama-3.1-8b-instant` and `llama-3.3-70b-versatile` in June 2026, and
`llama-4-scout-17b-16e-instruct` 404s there today. A retired name fails **every** run, so check
`GET /openai/v1/models` before blaming the workflow — [runbook](/project/runbook.md).

## Citations

- Live model list and the 413 TPM errors: `GET https://api.groq.com/openai/v1/models` and four benchmark calls (run 2026-08-19).
- Deprecation history and the free-tier quality scores: `meetapedia/config/providers.yaml` (read 2026-08-18).
