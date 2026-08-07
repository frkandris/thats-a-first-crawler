---
type: Tool
title: DeepSeek API
description: The OpenAI-compatible chat API that performs selection and parameter extraction for the digest, text-only.
resource: https://api-docs.deepseek.com
tags: [deepseek, api, chat, json-mode, llm]
timestamp: 2026-08-07T00:00:00Z
---

Selection + parameter extraction is **one text-only chat call** to the DeepSeek API, assembled by
[build-request-node](/project/build-request-node.md) and parsed by
[parse-response-node](/project/parse-response-node.md). It replaced the Anthropic Claude vision call on
**2026-08-07** — see [decisions](/project/decisions.md#deepseek).

## Request shape

```
POST https://api.deepseek.com/chat/completions
Authorization: Bearer <DEEPSEEK_API_KEY>
Content-Type: application/json

{
  "model": "deepseek-v4-pro",
  "max_tokens": 4000,
  "stream": false,
  "response_format": { "type": "json_object" },
  "messages": [
    { "role": "system",  "content": "<accented Hungarian instructions + json example>" },
    { "role": "user",    "content": "candidates by [index] …" }
  ]
}
```

The API is **OpenAI-compatible**: `messages`, `max_tokens`, `stream`, `response_format` behave as in the
OpenAI Chat Completions API, so any OpenAI SDK works by overriding `base_url`. Response text is at
`choices[0].message.content`.

## Models

| Model | Context | Max output | In (cache miss) | In (cache hit) | Out |
|---|---|---|---|---|---|
| `deepseek-v4-flash` | 1M | 384K | $0.14 / M | $0.0028 / M | $0.28 / M |
| `deepseek-v4-pro` | 1M | 384K | $0.435 / M | $0.003625 / M | $0.87 / M |

Both support non-thinking and **thinking (default)** modes. The digest uses **`deepseek-v4-pro`**: the
task is a judgement call written in accented Hungarian, and at one call per day the price difference is
under $0.05/month. DeepSeek's docs carry a notice that overall pricing will rise significantly.

## JSON output (the important constraint)

DeepSeek supports only `response_format: {"type": "json_object"}` — **not** a full JSON Schema, and not
OpenAI's `strict` mode. There is no server-side guarantee that the returned object matches our shape.
Three consequences, all handled in our nodes:

1. The prompt **must contain the word "json"** and an explicit **example of the desired structure** —
   otherwise the request is rejected or the output drifts. The schema lives in the prompt as a literal
   example, not in a `schema` field.
2. `max_tokens` must be generous enough that the JSON is not truncated mid-string.
3. The API **may occasionally return empty content** (acknowledged in DeepSeek's own docs). The parse
   step must treat empty/invalid content as *zero picks*, not as a crash — see
   [parse-response-node](/project/parse-response-node.md).

Because nothing is enforced server-side, [parse-response-node](/project/parse-response-node.md) **validates
and coerces every field** (index bounds, booleans, enum values) before scoring.

## No image input

The documented DeepSeek models are text-only. The pipeline no longer sends images to the model at all;
image handling is now purely a rendering concern
([wsrv proxy](/tech/wsrv-image-proxy.md) → [email](/project/email-format.md)). The whole base64 download
step and the robots.txt workaround it existed for are gone.

## Auth

One n8n HTTP Header Auth credential (`Authorization: Bearer <key>`), see
[credentials](/project/credentials.md). The key is pasted by the human, never by the assistant.

# Citations

- API docs: https://api-docs.deepseek.com — base URL, models, pricing, JSON mode (read 2026-08-07).
- JSON-mode requirements and the empty-content caveat: https://api-docs.deepseek.com/guides/json_mode
