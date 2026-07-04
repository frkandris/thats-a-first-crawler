# Log

Chronological history of ingests, queries, and lint passes. Newest last. Dates ISO 8601 `YYYY-MM-DD`.

## 2026-07-04

- **Ingest** — Initial wiki created from the *That's a First Digest* build session. Authored the
  project pages ([overview](/project/thats-a-first-digest.md), [pipeline](/project/pipeline.md),
  [ranking-algorithm](/project/ranking-algorithm.md), [email-format](/project/email-format.md),
  [build-request-node](/project/build-request-node.md), [parse-claude-node](/project/parse-claude-node.md),
  [dedup-datatable](/project/dedup-datatable.md), [credentials](/project/credentials.md),
  [runbook](/project/runbook.md), [decisions](/project/decisions.md)), the tech references
  ([n8n](/tech/n8n.md), [apify](/tech/apify.md), [claude-vision-api](/tech/claude-vision-api.md),
  [wsrv-image-proxy](/tech/wsrv-image-proxy.md)) and the format meta pages
  ([okf](/format/okf.md), [llm-wiki-pattern](/format/llm-wiki-pattern.md)).
- **Ingest** — Workflow milestones the same day: TikTok re-enabled on the paid Apify plan; switched
  Claude image inputs from URL to base64 (robots.txt); wsrv.nl image proxy adopted; vision-based
  ranking implemented; n8n attribution footer removed; workflow **published**; schedule changed
  **07:00 → 06:00**; "Save successful production executions" enabled.
- **Ingest** — Repo pushed to GitHub (`frkandris/thats-a-first-crawler`); README polished with badges;
  Schedule node renamed "Every day 07:00" → "Every day 06:00" and re-published; wiki updated to drop the
  label-mismatch caveat (lint: consistency).
- **Ingest** — Quality pass after a live run returned repeats + a fun "5DX cinema" item: search window
  **7 → 30 days**, Apify **50/hashtag**, robust **canon()** URL dedup, first-time-signal ranking with the
  analyzed pool **15 → 30**, and a stricter selection prompt (excludes ads/paid attractions/generic fun).
  Verified: a run then returned 5 genuine, varied firsts (analog photography, pottery, printmaking,
  foraged-raspberry sorbet). Re-published. Wiki synced across pipeline / build-request-node /
  dedup-datatable / decisions / runbook.
- **Lint** — Privacy pass: removed the "ChatGPT agent replica" framing and all personal email addresses
  from the wiki; recipient/sender are now described as "configured in the Config node / Gmail credential".
