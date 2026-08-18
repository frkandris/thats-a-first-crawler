---
type: Tool
title: Meetapedia router gateway
description: The OpenAI-compatible LLM gateway that routes the digest's one daily call across six free-tier providers, replacing the paid DeepSeek call.
resource: https://meetapedia.com/v1
tags: [llm, api, gateway, openai-compatible, free-tier, router]
timestamp: 2026-08-18T00:00:00Z
---

Selection + parameter extraction is **one text-only chat call** to the Meetapedia router gateway,
assembled by [build-request-node](/project/build-request-node.md) and parsed by
[parse-response-node](/project/parse-response-node.md). It replaced the direct
[DeepSeek](/tech/deepseek-api.md) call on **2026-08-18** — see
[decisions](/project/decisions.md#meetapedia-router).

The gateway is **another project of the same owner** (`meetapedia`, `scraper/web/api.py`), not a vendor.
It exposes that project's free-tier model router with the OpenAI wire format, so switching cost exactly
one URL, one credential and `model: 'auto'`.

## Request shape

```
POST https://meetapedia.com/v1/chat/completions
Authorization: Bearer <ROUTER_API_KEY>
content-type: application/json

{
  "model": "auto",
  "max_tokens": 8000,
  "stream": false,
  "response_format": { "type": "json_object" },
  "messages": [ {"role":"system", …}, {"role":"user", …} ]
}
```

Response is the upstream provider's body **unmodified** (`choices[0].message.content`, `usage`,
`finish_reason`) plus one additive field:

```json
"x_router": {"provider":"groq","model":"openai/gpt-oss-120b","quality":62,"requested":"auto"}
```

`x_router` is the only way to know which model actually answered — read it when a digest looks off.

## `model` is a routing policy, not a model name

| Value | Behaviour |
|---|---|
| `auto` | Best-quality model that still has daily quota. **What the digest sends.** |
| `groq` | Best model on that provider. |
| `groq:openai/gpt-oss-120b` | Exactly that model; a 429 rather than a quiet substitution. |
| `gemini-3.6-flash` | That model wherever it lives. |

The fleet behind `auto` (2026-08-18): Groq, Cerebras, Google Gemini, Mistral, OpenRouter `:free`. GitHub
Models is disabled upstream (410, service retirement). DeepSeek is in the catalogue but **parked** behind
`router.allow_paid: false`, so a free-tier day never silently spends money.

## What this costs us

Nothing per call — but the gateway spends the **same daily ledger as the Meetapedia crawler**, and on
2026-08-18 that turned out to be the binding constraint, in the opposite direction from what was assumed.

Measured at 11:52 UTC that day, `GET /v1/quota` read:

| provider | budget | used | remaining |
|---|---|---|---|
| cerebras | 536 | 579 | **0** |
| mistral | 475 | 491 | **0** |
| groq | 336 | 355 | **0** |
| gemini | 1425 | 804 | 621 (`blocked`) |
| openrouter | 47 | 51 | **0** |

Every live completion returned `502 upstream_unavailable: all providers rate limited` — eight attempts
over six minutes, none served. The crawler had spent the entire day's free capacity by midday, and the
`continuous worker` shipped the same morning removes the old time windows, so it now spends steadily
rather than in a night block.

**So "one call a day is negligible" is true about volume and false about availability.** The digest is
not a heavy consumer; it is a *late* one. Its call lands at 06:00 Europe/Berlin = **04:00 UTC**, four
hours after the ledger's midnight-UTC rollover and therefore behind whatever the crawler already took.
The gateway has **no per-key quota** — its own documentation names this as the feature to add when one
consumer starves another, which is exactly this case. Nothing about the digest's configuration can fix
it from this side; see [decisions](/project/decisions.md#meetapedia-router) for the options.

## <a id="json"></a>JSON mode is best-effort here

The gateway forwards `response_format` only to providers whose catalogue entry has `json_mode: true`; for
the others it **drops the field silently** and the prompt is the only thing asking for JSON
(`scraper/extract.py:805`, read 2026-08-18). So a fenced ```` ```json ```` answer is a normal outcome, not
a bug — [parse-response-node](/project/parse-response-node.md#jsonslice) cuts to the outermost braces
before parsing. The literal shape example in the system prompt is now load-bearing for a second reason.

Forwarded fields (everything else is dropped before the upstream call): `temperature`, `top_p`,
`max_tokens`, `max_completion_tokens`, `stop`, `presence_penalty`, `frequency_penalty`, `seed`, `n`,
`response_format`, `tools`, `tool_choice`, `user`.

**Streaming is refused**, not ignored: `stream: true` is a 400. `stream: false` is fine and is what the
digest sends.

**Limits:** 60 messages and 200,000 characters per request. The digest sends 2 messages of ~5K characters.

## Errors

OpenAI's envelope — `{"error":{"message","type","param","code"}}`:

| Status | `code` | Meaning | What to do |
|---|---|---|---|
| 401 | `invalid_api_key` | Bad/missing bearer token, or `ROUTER_API_KEY` unset on the gateway | fix the credential; see [credentials](/project/credentials.md) |
| 429 | `quota_exhausted` | Every model that could serve is out of daily budget | retry tomorrow, or flip `allow_paid` upstream |
| 429 | `rate_limited` | All candidates are inside a 429 back-off window | the node's own retry (3 tries, 5 s apart) usually clears it |
| 502 | `upstream_unavailable` | No provider answered | retry; the router picks a different provider |
| 503 | `router_disabled` | `router.enabled` off, or no provider key set | operator fix in the Meetapedia deploy |
| 400 | `stream` / `messages` | Malformed request | our bug — retrying will not help |

Retry is configured **on the n8n node** (`retryOnFail`, `maxTries: 3`, `waitBetweenTries: 5000`) precisely
because 429/502 are ordinary free-tier states, not outages. See [runbook](/project/runbook.md).

## Non-guarantees worth remembering

*Which* model answers `auto` is deliberately not fixed, latency varies widely across free tiers, and any
provider or model name can leave the catalogue (`config/providers.yaml` in the Meetapedia repo moves with
them). A model that vanishes surfaces here as a 404 `model_not_found` only if we pin it — with `auto` it
is invisible, which is the trade we accepted.

## Citations

- Gateway contract, auth, endpoints, error table: `meetapedia/docs/wiki/pages/integrations/router-gateway-api.md` (read 2026-08-18).
- Provider fleet, quotas, quality scores: `meetapedia/config/providers.yaml` (read 2026-08-18).
- Routing rationale (route-before-generate, daily ledger, 429 learning): `meetapedia/docs/wiki/pages/decisions/free-tier-model-router.md` (read 2026-08-18).
- Forwarded-field allowlist and the `json_mode` drop: `meetapedia/scraper/extract.py:788-808` (read 2026-08-18).
