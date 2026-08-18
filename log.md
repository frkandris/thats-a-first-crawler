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
- **Ingest** — **First real digest sent on DeepSeek** (5 picks: boxing in Montgomery, diving in Sabang,
  analogue photography in Ireland, golf, fresh pasta near Dublin). `finish_reason: stop`,
  `truncated: false` — the token fix holds, and the tuned Hungarian prompt survived the migration:
  accented output, activity-first lines, no names.
- **Lint** — A third failure, this one self-inflicted: renaming `Parse Claude` → `Parse response` left
  **Split picks** calling `$('Parse Claude')`. n8n resolves those references by display name at runtime
  and warns about nothing, so the workflow saved clean and the email went out — but the dedup rows were
  never written, which would have repeated all five posts the next day. Fixed the reference, backfilled
  the five rows straight into the Data Table (a re-run would have sent a second email), and swept every
  Code node for stale references (none left). Recorded as a general n8n trap in
  [n8n](/tech/n8n.md#renaming) plus two [runbook](/project/runbook.md) rows — including the structural
  point that the Gmail send sits **upstream** of the dedup write, so a failure there is invisible to the
  recipient.

## 2026-08-10

- **Query** — "no email in the mornings". Two separate causes, neither of them the model migration.
  1. **Apify monthly hard limit.** The 08-09 and 08-10 scheduled runs both died at `Apify - Instagram`
     with **403 / `Monthly usage hard limit exceeded`**; nothing downstream ran, so no digest. The 08-08
     run had succeeded. Recorded in [runbook](/project/runbook.md). Needs a billing decision from the
     human — not fixable from here.
  2. **Dedup had never worked.** Investigating the one successful run exposed it.
- **Lint** — **Correction: the wiki's "robust dedup" claim was false.** `Get sent` hung off Config as a
  *parallel* branch, and n8n with `executionOrder: v1` runs a parallel branch **after** the main chain —
  measured at +239 678 ms versus Build request at +135 656 ms. So `$('Get sent')` threw, the surrounding
  `try/catch` turned it into an empty set, and every candidate passed the filter. The node showed a
  healthy item count in the UI, so nothing looked wrong. Evidence: the dedup table holds **183 rows but
  only 147 unique canonical URLs** — 21 posts emailed more than once, one TikTok five times between
  07-17 and 08-03, and the 08-08 digest repeated **4 of its 5 picks** from 08-07. This predates the
  DeepSeek migration by weeks.
  **Fixed:** `Get sent` and `Get counts` are now wired **in line** (`Config → Get sent → Get counts →
  Apify - Instagram → …`) with `Execute Once`; the swallowing `try/catch` is replaced by a named thrown
  error; Build request emits `sentRowCount`/`countsRowCount` so an empty read can never hide again.
  Generalised in [n8n](/tech/n8n.md#branch-order) and promoted to a ground-truth invariant in
  [CLAUDE.md](/CLAUDE.md). Also explains why the hashtag delta was `null` on 08-08 despite 08-07 rows
  existing — same root cause, same fix.
  **Not yet verified against a live run:** the Apify limit blocks execution, so the fix is written and
  wired but unproven.

## 2026-08-18

- **Ingest** — **Model switch: paid DeepSeek → the Meetapedia free-tier router.** The user asked to reuse
  the free AI access already built in their `../meetapedia` project. That project exposes its free-tier
  model router as an **OpenAI-compatible gateway** (`meetapedia.com/v1/chat/completions`,
  `scraper/web/api.py`), so the digest now sends `model: 'auto'` and the router picks the best free model
  with daily quota left across Groq / Cerebras / Gemini / Mistral / OpenRouter. New page
  [meetapedia-router](/tech/meetapedia-router.md); ADR in
  [decisions](/project/decisions.md#meetapedia-router).
  Live workflow changes (n8n REST API, then **Publish** in the editor):
  - **New node `AI - Meetapedia router`** (HTTP Request) between `Build request` and `Parse response`,
    with `retryOnFail`, `maxTries: 3`, `waitBetweenTries: 5000` — free-tier 429/502 are ordinary states,
    not outages.
  - **The `DeepSeek` node was disabled and unwired, not renamed or deleted.** Rollback is one enable plus
    one connection. Verified against the live JSON that **nothing references either node with `$('…')`**,
    so the [rename trap](/tech/n8n.md#renaming) does not apply here.
  - `Build request`: `model: 'deepseek-v4-pro'` → `'auto'`, `max_tokens: 16000` → **8000** (Gemini's free
    tier caps output at 8192 and rejects a larger ceiling; the budget is still a *reasoning* budget).
  - `Parse response`: new `jsonSlice()` strips a markdown fence and cuts to the outermost braces before
    `JSON.parse` — the gateway **silently drops `response_format`** for providers with `json_mode: false`
    (`meetapedia/scraper/extract.py:805`), so a fenced answer is now a normal outcome rather than a
    zero-pick day. No-op on a clean `json_object` answer.
  - New credential **`Meetapedia router header`** (HTTP Header Auth). It was created with a **placeholder
    value** — the human pastes the real `ROUTER_API_KEY`; the assistant never types secrets.
  - `Build request`'s output list keeps the router **first** and `Split counts` second, preserving the
    execution order that the [dedup fix](/project/decisions.md#dedup-order) depends on.
  - Both patched Code nodes were re-read from the server and `node --check`ed (wrapped in an async IIFE,
    since top-level `await` is legal only inside n8n's wrapper).
  - Cost: the model line goes ~$0.09/month → **$0**; [Apify](/tech/apify.md) is now the entire bill.
    The new cost is *shared quota* with the Meetapedia crawler, visible at `GET /v1/quota`.
- **Ingest** — [deepseek-api](/tech/deepseek-api.md) marked **superseded**, not deleted: it still
  documents the disabled standby node, and its thinking-token trap applies to the free reasoning models
  (`gpt-oss`) as well. Cross-references updated in [pipeline](/project/pipeline.md),
  [build-request-node](/project/build-request-node.md),
  [parse-response-node](/project/parse-response-node.md), [credentials](/project/credentials.md),
  [runbook](/project/runbook.md) (401/429/502/503 rows + a rollback row),
  [ranking-algorithm](/project/ranking-algorithm.md), [thats-a-first-digest](/project/thats-a-first-digest.md),
  [n8n](/tech/n8n.md), the three index pages, the README badges and the
  [CLAUDE.md](/CLAUDE.md) ground-truth invariants.
- **Ingest** — **Key provisioned the same day.** A dedicated `sk-firstdigest-…` key was generated locally,
  written into the n8n credential over the API (the placeholder credential was deleted and recreated —
  the public API has no credential-update route — and the router node re-pointed at the new id), and
  **appended** to the gateway's existing `ROUTER_API_KEY`. That variable already held a value for another
  consumer, and the gateway parses it as a comma-separated allowlist, so overwriting it would have revoked
  that consumer. Set on the Meetapedia deployment's `community-scraper` app (Coolify → Environment
  Variables, Production scope); it needs a redeploy to take effect.
- **Lint** — **The "API writes are not published" claim in [runbook](/project/runbook.md) was wrong** for
  this n8n version: after the PUT, Version History showed `Current changes (Published)` stamped with the
  write's timestamp and the Publish button was disabled. Corrected rather than deleted, keeping the case
  that *does* still need Publish (inactive workflow, or an edit made in the editor).
- **Ingest** — **Verification, and the wall it hit.** The key works: `GET /v1/models` answered 200 on
  12/12 calls with the new bearer token. But **no live completion could be served all day**: eight
  attempts (Cloudflare bypassed, so the gateway's own envelope was visible) returned
  `502 upstream_unavailable: all providers rate limited`, and `GET /v1/quota` at 11:52 UTC showed
  `remaining: 0` on cerebras, mistral, groq and openrouter, with gemini `blocked`. The Meetapedia crawler
  had spent the day's free capacity by midday. Recorded in [meetapedia-router](/tech/meetapedia-router.md)
  and as an ADR consequence in [decisions](/project/decisions.md#meetapedia-router).
  **Decision (user, 2026-08-18): change nothing, observe the 06:00 run** — 04:00 UTC is four hours after
  the rollover, not twelve, so midday exhaustion does not predict dawn. A morning-check procedure is in
  [runbook](/project/runbook.md), reading `x_router` first.
- **Ingest** — Two operational facts worth keeping. The site returned proxy-level **404s for ~10 minutes**
  after the env change, and it was **not** the env: the app logged `model_router_ready … total=12` and
  `pipeline_complete` throughout. Two deploys ran back to back — the operator's manual one and an
  **API-sourced** one two minutes later on the same commit — and during the container swap Traefik had no
  route. Success rate went 404 → mixed → 12/12 without intervention. The Meetapedia wiki's own warning
  about concurrent deploys covers this; the lesson here is to **diagnose from the runtime log, not from
  the public URL**, before touching anything. Second: the digest's Cloudflare path adds a failure mode the
  gateway docs do not — a call that waits out a per-minute pacing window returned Cloudflare's own
  `error code: 502` (plain text, not the OpenAI error envelope) after 55 s.
- **Lint** — Full pass over the bundle after the router switch. **Structure clean:** 23 concept pages, every
  non-reserved page carries a non-empty `type`, 0 broken bundle-relative links, 0 orphans, README badge
  count matches. **Verified against ground truth** rather than by reading: the live workflow JSON was
  diffed against the pipeline/build-request/parse-response pages — router URL, `maxTries: 3` /
  `waitBetweenTries: 5000`, `DeepSeek` disabled *and* absent from `connections`, `Build request`'s output
  order (`AI - Meetapedia router` before `Split counts`), schedule hour 6, `model: 'auto'`,
  `max_tokens: 8000`, `lookbackDays: 30`, 5 hashtags, `cands.slice(0, 30)`, `items.slice(0, 5)`,
  `executeOnce` on all three Apify nodes, `jsonSlice` present — all match.
  **Three defects found and fixed:** [deepseek-api](/tech/deepseek-api.md) still asserted
  `max_tokens` **is now 16000**, contradicting the 8000 shipped that morning (it now records both values
  and which one a rollback would use); [ranking-algorithm](/project/ranking-algorithm.md) and
  [n8n](/tech/n8n.md) were edited that day but kept their 2026-08-07 timestamps; and
  [wsrv-image-proxy](/tech/wsrv-image-proxy.md) still scoped "no images" to the DeepSeek call, which now
  reads as if the claim expired with it.
