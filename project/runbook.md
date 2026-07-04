---
type: Playbook
title: Runbook
description: How to operate, test, and troubleshoot the digest workflow.
resource: https://n8n.strt.hu/workflow/JEHhYDEEklYRoIHb
tags: [operations, runbook, troubleshooting]
timestamp: 2026-07-04T00:00:00Z
---

Operational guide for [That's a First Digest](/project/thats-a-first-digest.md).

## Normal operation

- Runs **daily 06:00** Europe/Berlin. It is **Published**; edits require re-publishing to take effect.
- "Save successful production executions" is **on** → runs appear under the workflow's *Executions* tab.
- One email per day to `andris@strt.hu`, subject `[that's a first] YYYY-MM-DD`.

## Manual run / test

Open the workflow in [n8n](/tech/n8n.md) → **Execute workflow**. A full run is ~1–1.5 min
(Apify scrape + ~15 base64 image downloads + Claude vision). Check the new email in Gmail.

## Editing a Code node

Paste replaces the whole editor: click the code area → Cmd+A → Cmd+V. After edits: Cmd+S to save,
then **Publish** to activate. See [build-request-node](/project/build-request-node.md) /
[parse-claude-node](/project/parse-claude-node.md).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Claude 400 "disallowed by robots.txt" | image sent as URL source | send base64 (already implemented) — see [decisions](/project/decisions.md#images) |
| TikTok "Payment required / 16384MB" | Apify node ran once per input item | `Execute Once` on both Apify nodes; `memory=4096`; ensure paid plan credit |
| Images blank in Gmail | raw IG/TikTok CDN hotlink block | use the [wsrv.nl proxy](/tech/wsrv-image-proxy.md) URL |
| Titles start with "Először" / no accents | prompt anchored on negative examples / ASCII | accented prompt, positive examples only |
| "This email was sent automatically with n8n" footer | Gmail attribution default on | Gmail node → Options → **Append n8n Attribution** = off |
| No email | 0 picks after dedup/selection | expected when nothing qualifies; check **Has picks?** |

## Cost

Per run: Apify scrape (cheap on paid plan) + one Claude Opus 4.8 vision call (~15 images, a few cents).
