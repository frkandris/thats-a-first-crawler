# Log

Chronological history of ingests, queries, and lint passes. Newest last. Dates ISO 8601 `YYYY-MM-DD`.

## 2026-07-04

- **Ingest** — Initial wiki created from the *That's a First Digest* build session. Authored the
  project pages ([overview](/project/thats-a-first-digest.md), [pipeline](/project/pipeline.md),
  [ranking-algorithm](/project/ranking-algorithm.md), [email-format](/project/email-format.md),
  [build-request-node](/project/build-request-node.md), `parse-claude-node` (since renamed to
  [parse-response-node](/project/parse-response-node.md)),
  [dedup-datatable](/project/dedup-datatable.md), [credentials](/project/credentials.md),
  [runbook](/project/runbook.md), [decisions](/project/decisions.md)), the tech references
  ([n8n](/tech/n8n.md), [apify](/tech/apify.md), `claude-vision-api` (deleted 2026-08-07),
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
- **Lint** — Privacy pass: neutralized the origin-story framing, removed all personal email addresses,
  and generalized the internal n8n host and the workflow/project/table IDs to placeholders
  (`https://<n8n-host>/workflow/<workflow-id>`, etc.). Recipient/sender are now described as
  "configured in the Config node / Gmail credential".
- **Ingest** — Apify cost tuning: `resultsLimit`/`resultsPerPage` **50 → 12** per hashtag to hit a
  ~$10/month Apify budget (~$0.32/run). Re-published; wiki synced (pipeline, build-request-node, decisions).

## 2026-07-24

- **Ingest** — Website MVP built in `web/` (code only, no deploy): Next.js 16 + TypeScript + Tailwind,
  SQLite via built-in `node:sqlite`. Public site (Hungarian): landing with origin story, 50-item
  browsable collection with per-activity copyable friend-invite messages, newsletter signup,
  downloadable 50-item PDF (`npm run pdf`). Admin: crawler-discovery inbox with status flow and
  per-post outreach-message generation (manual DM send), and a monthly newsletter builder
  (first-Wednesday send, weeks-countdown to the last Wednesday, HTML export). Researched Substack:
  **no official public API** → delivery is a pluggable publisher adapter (manual export +
  Buttondown API). New concept page: [website](/project/website.md); cross-linked from
  [thats-a-first-digest](/project/thats-a-first-digest.md) and both indexes.
- **Ingest** — i18n: the website is now fully bilingual (hu/en). Locale-prefixed routes with
  Accept-Language redirect in `proxy.ts`; Hungarian URL aliases (`/hu/gyujtemeny`) via rewrites;
  full UI dictionary + all 50 collection items translated to English (categories moved to neutral
  keys); bilingual DB columns with a dev-migration; subscriber and newsletter-issue `locale`
  (HU and EN issues are separate, both rendered in their own language); outreach messages
  generatable in HU or EN; the lead-magnet PDF generated per language. Admin UI copy stays
  Hungarian. [website](/project/website.md) updated.
- **Lint** — Codex review, 3 rounds on the web MVP; fixed: subscriber locale upsert (language
  change on re-subscribe), concrete date in invite messages, `UNIQUE(month, locale)` index with
  atomic issue get-or-create, `activity_label_en` on discoveries (EN outreach/newsletter no longer
  mix in Hungarian), locale switcher preserves query params (with `kategoria`↔`category` rename),
  attribute-safe escaping + http(s)-only URLs in newsletter HTML, strict `YYYY-MM` month
  validation in the issue builder. One false positive dismissed (legacy `UNIQUE(month)` never
  existed). Verified by build + smoke tests.

## 2026-08-07

- **Ingest** — **Model switch: Claude vision → DeepSeek chat, text-only.** The workflow now calls
  `deepseek-v4-pro` at `api.deepseek.com/chat/completions` with `response_format: json_object`.
  New page [deepseek-api](/tech/deepseek-api.md); the old `tech/claude-vision-api.md` was deleted.
  Consequences captured across the wiki: image download / base64 assembly removed from
  [build-request-node](/project/build-request-node.md); "Parse Claude" renamed and rewritten as
  [parse-response-node](/project/parse-response-node.md) with an explicit **validation table**, because
  DeepSeek's JSON mode enforces no schema and its docs admit occasionally-empty responses;
  [ranking-algorithm](/project/ranking-algorithm.md) lost the image-derived `kepTipus` (+8/+4) and
  `ratirtSzoveg` (−10) params — the user chose to drop them rather than substitute caption heuristics,
  accepting flatter ordering; [credentials](/project/credentials.md) swapped Anthropic → DeepSeek and
  flags the chat-pasted key as compromised (rotate it). Cost fell from ~$8/mo to ~$0.09/mo for the model
  line. The [wsrv proxy](/tech/wsrv-image-proxy.md) stays — images still render in the email, only the
  model stopped seeing them.
- **Ingest** — **New feature: hashtag delta block** in the email ("how many new posts per hashtag since
  yesterday"). Counting our own scrape was impossible (12 posts/hashtag would cap the number), and a
  bigger scrape would have cost ~$25–80/mo, so the user chose a stored daily total: a third Apify node
  (`apify~instagram-hashtag-analytics-scraper`, `postsCount`, ~$0.21/mo) plus the new
  [hashtag-counts-datatable](/project/hashtag-counts-datatable.md), with the delta rendered per
  [email-format](/project/email-format.md#hashtag-delta). Instagram only — TikTok exposes no hashtag
  total. Key invariant recorded: the counts branch must bypass `Has picks?` so totals are stored on
  no-email days too.
- **Ingest** — Wiki extended per the `kondfox/ai-utils` **LLM-wiki bootstrap prompt** (the third source
  alongside Karpathy's gist and the OKF spec, both already in use). Its page discipline is now binding in
  [CLAUDE.md](/CLAUDE.md) and documented in [llm-wiki-pattern](/format/llm-wiki-pattern.md): one concept
  per page (~200 lines), answer-first, mandatory provenance, absolute dates, conservative bias,
  supersede-don't-delete, wiki-updates-in-the-same-commit. Its Obsidian `[[wiki-link]]` syntax was
  **rejected** in favor of OKF bundle-relative links.
- **Ingest** — Website tech knowledge lifted out of the single [website](/project/website.md) page into
  four reusable `tech/` pages: [nextjs](/tech/nextjs.md) (Next 16 `proxy.ts` instead of `middleware.ts`,
  async params, Hungarian URL rewrites), [node-sqlite](/tech/node-sqlite.md) (built-in `node:sqlite`,
  `globalThis` connection singleton, dev-only migrations),
  [newsletter-delivery](/tech/newsletter-delivery.md) (Substack has no API → publisher adapters;
  Buttondown draft API) and [pdfkit](/tech/pdfkit.md) (embedded TTF required for `ő`/`ű`).
- **Lint** — Full pass after the migration: no page still references the Anthropic call, all indexes
  updated, the `#images` decision marked **superseded** rather than deleted, timestamps refreshed on
  every page whose subject changed, bundle-relative links verified.
- **Ingest** — **The migration was applied to the live n8n workflow** over the public REST API, not just
  documented. Created the `thats_a_first_hashtag_counts` Data Table; rewrote the workflow to 16 nodes:
  `Claude` → `DeepSeek` (new URL, `content-type` only, `DeepSeek header` credential), `Parse Claude` →
  `Parse response`, new `Apify - Hashtag stats` / `Get counts` / `Split counts` / `Insert count row`,
  and `hashtags[]` added to Config. The counts branch hangs off **Build request**, so it bypasses
  `Has picks?` as required. The original workflow JSON is backed up before the change.
  The workflow was left **deactivated** on purpose: the DeepSeek credential holds a placeholder value
  until the human pastes the rotated key, and an active workflow would have failed the 06:00 run.
- **Lint** — Correction to [ranking-algorithm](/project/ranking-algorithm.md) after reading the *actual*
  production prompt (it was not in the repo — the wiki had described it second-hand). The prompt tells
  the model to answer `felnott: true` **when uncertain**, so caption-only extraction makes it almost
  always true, turning its `+20` into a near-constant offset rather than the "more often false" the page
  first claimed. Ordering effectively rests on two bits now; two concrete fallbacks recorded.
- **Ingest** — First live runs of the migrated workflow, and two real failures worth keeping:
  1. **Apify 402** — the billing-cycle usage limit was exhausted ($0.000899 left), so the run died at the
     first Apify call. Not a workflow bug; recorded in [runbook](/project/runbook.md).
  2. **Thinking tokens ate the answer.** After the Apify limit was lifted the run went green end to end
     (60 IG + 60 TikTok items, 5 hashtag stats, 30 candidates) but produced **0 picks and no email**.
     Cause: `deepseek-v4-pro` thinks by default and reasoning tokens come out of `max_tokens` — the call
     returned `finish_reason: length` with `completion_tokens: 4000`, *all* of it reasoning, and empty
     content. Fixed by raising `max_tokens` **4000 → 16000**;
     [parse-response-node](/project/parse-response-node.md) now emits `finishReason` + `truncated` so a
     budget failure is never again mistaken for an empty selection. Documented at
     [deepseek-api](/tech/deepseek-api.md#thinking).
  The hashtag statistics themselves worked on the first try (`postsCount` field name confirmed against a
  real response: `#thatsafirst` = 4 094 000). The delta block is still absent by design — the counts
  table only has today's rows, so there is nothing to diff against until tomorrow.
