---
type: Tool
title: Claude vision API
description: How the workflow calls the Anthropic Messages API with images and structured output.
resource: https://docs.claude.com
tags: [claude, anthropic, vision, api, structured-output]
timestamp: 2026-07-04T00:00:00Z
---

Selection + parameter extraction is one call to the Anthropic **Messages API** with model
`claude-opus-4-8`, assembled by [build-request-node](/project/build-request-node.md).

## Request shape

```
POST https://api.anthropic.com/v1/messages
x-api-key: <ANTHROPIC_KEY>
anthropic-version: 2023-06-01

{
  "model": "claude-opus-4-8",
  "max_tokens": 4000,
  "system": "<accented Hungarian instructions>",
  "messages": [{ "role": "user", "content": [
    { "type": "text", "text": "candidates by [index] …" },
    { "type": "text", "text": "Kép a(z) [0] jelölthöz:" },
    { "type": "image", "source": { "type": "base64", "media_type": "image/jpeg", "data": "…" } },
    …
  ]}],
  "output_config": { "effort": "medium", "format": { "type": "json_schema", "schema": { … } } }
}
```

## Key facts (learned)

- **Images must be base64**, not `source.type:"url"` — URL sources are rejected with 400 when the host's
  robots.txt disallows fetching (Instagram/wsrv). See [decisions](/project/decisions.md#images).
- **Structured output** via `output_config.format = {type:'json_schema', schema}`; `enum` and `boolean`
  and `integer` are supported. The model is forced to return the schema
  (`{picks:[{index,line,csoportos,oktatos,felnott,kepTipus,ratirtSzoveg}]}`).
- `effort: medium` balances quality and latency; a full vision run is tens of seconds.
- Response text is in `content[].text`; parse with `JSON.parse` in [parse-claude-node](/project/parse-claude-node.md).

## Model note

`claude-opus-4-8` is the current default Opus with a 1M context and vision. Do not downgrade without
an explicit request. (Anthropic's most capable model family at time of writing is Claude Fable 5 /
Opus 4.8 / Haiku 4.5.)
