---
type: Playbook
title: Runbook
description: How to operate, test, and troubleshoot the digest workflow.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [operations, runbook, troubleshooting]
timestamp: 2026-08-07T00:00:00Z
---

Operational guide for [That's a First Digest](/project/thats-a-first-digest.md).

## Normal operation

- Runs **daily 06:00** Europe/Berlin. It is **Published**; edits require re-publishing to take effect.
- "Save successful production executions" is **on** → runs appear under the workflow's *Executions* tab.
- One email per day to the configured recipient, subject `[that's a first] YYYY-MM-DD`.

## Manual run / test

Open the workflow in [n8n](/tech/n8n.md) → **Execute workflow**. A full run is well under a minute
(Apify scrape + hashtag stats + one text-only [DeepSeek](/tech/deepseek-api.md) call). It got noticeably
faster on 2026-08-07: the ~15 image downloads and the vision call are gone. Check the new email in Gmail.

**Publishing matters:** writing the workflow over the REST API saves it, but the scheduled 06:00 run uses
the **published** version. After any API-side change, hit **Publish** in the editor.

**Testing the hashtag delta:** the block needs at least two runs on different dates to show anything —
the first run only seeds [the counts table](/project/hashtag-counts-datatable.md) and the block is
omitted. To verify sooner, insert a row manually with a `checked_date` of yesterday.

## Editing a Code node

Paste replaces the whole editor: click the code area → Cmd+A → Cmd+V. After edits: Cmd+S to save,
then **Publish** to activate. See [build-request-node](/project/build-request-node.md) /
[parse-response-node](/project/parse-response-node.md).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| DeepSeek returns empty content | known DeepSeek JSON-mode issue (documented by the vendor) | the parse node treats it as 0 picks and sends no email; if it recurs daily, re-run manually — see [deepseek-api](/tech/deepseek-api.md) |
| `JSON.parse` error in Parse response | prompt lost the literal "json" example, or `max_tokens` too low and output truncated | restore the example in the system prompt; keep `max_tokens: 4000` — see [build-request-node](/project/build-request-node.md) |
| Picks have wrong/missing fields | no server-side schema in DeepSeek's JSON mode | validation/coercion in [parse-response-node](/project/parse-response-node.md) handles it; tighten the prompt example if it persists |
| Hashtag block missing from the email | first run, or no comparable previous row | expected — it needs a second run on a later date ([hashtag-counts-datatable](/project/hashtag-counts-datatable.md)) |
| Hashtag deltas absurdly large after downtime | delta spans several days | by design; the block prints `(N nap alatt)` |
| Any Apify node: **402** "Payment required … you will exceed your remaining usage of $X" | The Apify **usage limit** for the billing cycle is reached (X is what is left, often fractions of a cent). Not a workflow bug — the run dies at the first Apify call and nothing downstream executes. | Check [console.apify.com/billing](https://console.apify.com/billing/subscription): raise the cap, or wait for the cycle to roll over. Observed 2026-08-07 with $0.000899 left. |
| TikTok "Payment required / 16384MB" | Apify node ran once per input item | `Execute Once` on all Apify nodes; `memory=4096`; ensure paid plan credit |
| Images blank in Gmail | raw IG/TikTok CDN hotlink block | use the [wsrv.nl proxy](/tech/wsrv-image-proxy.md) URL |
| Titles start with "Először" / no accents | prompt anchored on negative examples / ASCII | accented prompt, positive examples only |
| "This email was sent automatically with n8n" footer | Gmail attribution default on | Gmail node → Options → **Append n8n Attribution** = off |
| Repeated posts | URL-format mismatch defeated dedup | `canon()` normalizes both sides ([dedup-datatable](/project/dedup-datatable.md)); reposts with different URLs are a known gap |
| Too few / fun items | analyzing only top-by-engagement; loose filter | first-time-signal ranking + 30 analyzed + strict exclusion ([decisions](/project/decisions.md)) |
| No email | 0 picks after dedup/selection | expected when nothing qualifies; check **Has picks?** |

## Cost

| Item | Per run | Per month |
|---|---|---|
| Apify post scrapers (12/hashtag × 5 × 2 platforms) | ~$0.32 | ~$9.6 |
| Apify hashtag analytics (5 results) | ~$0.007 | ~$0.21 |
| [DeepSeek](/tech/deepseek-api.md) `deepseek-v4-pro`, text-only (~5k in / ~1k out) | ~$0.003 | ~$0.09 |
| **Total** | **~$0.33** | **~$9.9** |

The model line used to be ~$8/month on Claude Opus vision; dropping the images made it effectively free,
and the hashtag block fits inside the saving. Apify remains the entire budget. DeepSeek's docs warn that
their pricing will rise significantly — revisit this table when that lands.
