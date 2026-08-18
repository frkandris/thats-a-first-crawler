---
type: Playbook
title: Runbook
description: How to operate, test, and troubleshoot the digest workflow.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [operations, runbook, troubleshooting]
timestamp: 2026-08-18T00:00:00Z
---

Operational guide for [That's a First Digest](/project/thats-a-first-digest.md).

## Normal operation

- Runs **daily 06:00** Europe/Berlin. It is **Published**; edits require re-publishing to take effect.
- "Save successful production executions" is **on** → runs appear under the workflow's *Executions* tab.
- One email per day to the configured recipient, subject `[that's a first] YYYY-MM-DD`.

## Manual run / test

Open the workflow in [n8n](/tech/n8n.md) → **Execute workflow**. A full run is well under a minute
(Apify scrape + hashtag stats + one text-only [router](/tech/meetapedia-router.md) call). It got noticeably
faster on 2026-08-07: the ~15 image downloads and the vision call are gone. Check the new email in Gmail.

**Which model answered?** Open the **AI - Meetapedia router** node's output and read `x_router`
(`provider`, `model`, `quality`). With `model: 'auto'` this changes run to run — a digest that suddenly
reads worse is a routing question before it is a prompt question.

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
| Run is green but **0 picks and no email**, `truncated: true` on Parse response | `finish_reason: length` — reasoning tokens consumed the whole `max_tokens`. Observed 2026-08-07 at `max_tokens: 4000` (4000/4000 reasoning, empty content). | `max_tokens` is **8000** in Build request; do not raise it past 8192, which part of the fleet rejects. Pin a non-reasoning model for the run instead — see [meetapedia-router](/tech/meetapedia-router.md) |
| DeepSeek returns empty content without `finish_reason: length` | known DeepSeek JSON-mode issue (documented by the vendor) | the parse node treats it as 0 picks and sends no email; if it recurs daily, re-run manually — see [deepseek-api](/tech/deepseek-api.md) |
| `JSON.parse` error in Parse response | prompt lost the literal "json" example, or the answer was truncated. A markdown fence is **not** a cause any more — `jsonSlice` strips it ([parse-response-node](/project/parse-response-node.md#jsonslice)) | restore the example in the system prompt; check `raw` on the parse output to see what the model actually sent |
| Picks have wrong/missing fields | no server-side schema anywhere in the fleet; a `json_mode: false` provider does not even get `response_format` | validation/coercion in [parse-response-node](/project/parse-response-node.md) handles it; check `x_router` for which model, tighten the prompt example if it persists |
| **AI - Meetapedia router** returns **401** `invalid_api_key` | the `Meetapedia router header` credential holds a placeholder, or the key is not in the gateway's `ROUTER_API_KEY` allowlist | paste the real key into the n8n credential; verify with `curl -H "Authorization: Bearer <key>" https://meetapedia.com/v1/models` |
| **429** `quota_exhausted` | every free provider is out of *daily* budget — a normal free-tier end state, not an outage | `GET /v1/quota` shows per-provider `remaining`; wait for the UTC rollover, or run the digest manually later. Persistent → enable the DeepSeek standby |
| **429** `rate_limited` / **502** `upstream_unavailable` | a per-minute window or a provider hiccup | the node retries 3× at 5 s and the router picks another provider; nothing to do unless it fails all three |
| **503** `router_disabled` | the Meetapedia deploy has `router.enabled: false` or no provider keys | operator fix in that project; meanwhile use the DeepSeek standby |
| Digest missing and the router is down for good | gateway outage | **Rollback:** enable the disabled `DeepSeek` node, connect `Build request → DeepSeek → Parse response` (keep the router node's slot order — `Split counts` must stay second), set `model` back to `'deepseek-v4-pro'` in Build request, Publish. The `DeepSeek header` credential is still in place |
| `Cannot assign to read only property 'name' of object 'Error: Referenced node doesn't exist'` | a Code node calls `$('Old Node Name')` after that node was renamed | update the string; grep every Code node after any rename — see [n8n](/tech/n8n.md#renaming) |
| Email went out but the post repeats the next day | **Split picks / Insert row** failed after Gmail already sent | the send is upstream of the dedup write, so a failure there is silent from the recipient's side. Backfill the missing rows into [the dedup table](/project/dedup-datatable.md) rather than re-running (a re-run sends a second email). |
| Hashtag block missing from the email | first run, or no comparable previous row | expected — it needs a second run on a later date ([hashtag-counts-datatable](/project/hashtag-counts-datatable.md)) |
| Hashtag deltas absurdly large after downtime | delta spans several days | by design; the block prints `(N nap alatt)` |
| Any Apify node: **403** "Forbidden" / `Monthly usage hard limit exceeded` | The Apify account's **monthly hard limit** is hit. Distinct from the 402 below: the hard limit blocks outright. Seen 2026-08-09 and 08-10 — two mornings with no digest. | Raise or reset the hard limit in [Apify billing](https://console.apify.com/billing/subscription). Nothing downstream runs, so no email at all. |
| The same posts arrive on consecutive mornings | dedup read was empty — check `sentRowCount` on the Build request output | if it is `0` with a non-empty table, `Get sent` is not an ancestor of Build request — see [dedup-datatable](/project/dedup-datatable.md#silent-failure) |
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
| [Meetapedia router](/tech/meetapedia-router.md) `auto`, text-only (~5k in / ~1k out) | **$0** | **$0** |
| **Total** | **~$0.33** | **~$9.9** |

The model line went ~$8/month (Claude Opus vision) → ~$0.09 (DeepSeek, 2026-08-07) → **$0** (free-tier
router, 2026-08-18). Apify is now the entire budget, and the only thing worth optimising. The router's
cost is not money but *shared daily quota* with the Meetapedia crawler — one call a day against budgets of
500–14400 requests/day, so it is noise, but check `GET /v1/quota` before ever batching runs.
