---
type: Code Node
title: Parse Claude node
description: Parses the Claude vision response, scores and sorts the picks deterministically, and renders the email HTML.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [code, n8n, ranking, html]
timestamp: 2026-07-04T00:00:00Z
---

An [n8n](/tech/n8n.md) Code node after the Claude HTTP node. It owns the
[ranking](/project/ranking-algorithm.md) and the [email rendering](/project/email-format.md).

## Steps

1. **Parse** `response.content[].text` → `JSON.parse` → `{picks:[…]}`.
2. **Enrich** each pick: look up `cands[pick.index]` from
   [build-request-node](/project/build-request-node.md) (via `$('Build request').first().json.cands`)
   to recover `url, platform, image (proxied), hashtags, engagement`.
3. **Score** with the formula in [ranking-algorithm](/project/ranking-algorithm.md); dedupe by url
   (keep highest score).
4. **Sort** by score desc, tie-break engagement desc; take top 5.
5. **Render** the numbered HTML per [email-format](/project/email-format.md).
6. **Output** `{ picks, html, runDate, candidateCount }`.
   - `picks` (with `line`, `url`, `platform`, scores) is consumed by **Split picks** →
     [dedup table](/project/dedup-datatable.md) (`activity` column = `pick.line`).
   - `html` is consumed by the Gmail node.

## Notes

- `line` from Claude carries the description **without** the platform; the platform link is appended
  here so the clickable-link rule is guaranteed in code.
- If `picks.length === 0`, **Has picks?** stops the run and no email is sent.
