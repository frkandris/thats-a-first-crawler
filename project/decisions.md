---
type: Decision Log
title: Design decisions
description: Why the system is built the way it is — the non-obvious choices and what forced them.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [decisions, adr, rationale]
timestamp: 2026-08-20T00:00:00Z
---

Non-obvious choices, newest context on top. Each is a small ADR.

## <a id="drop-hashtag-counts"></a>The hashtag delta block is removed (2026-08-20)
The block never worked, and the evidence is unambiguous: **the stored totals did not move at all**.

| hashtag | 08-07 | 08-08 | 08-19 | 08-20 |
|---|---|---|---|---|
| #thatsafirst | 4 094 000 | 4 094 000 | 4 094 000 | 4 094 000 |
| #tryingnewthings | 72 278 000 | 72 278 000 | 72 278 000 | 72 278 000 |
| #tryingsomethingnew | 51 387 000 | 51 387 000 | 51 387 000 | 51 387 000 |
| #newexperience | 1 010 000 | 1 010 000 | 1 010 000 | 1 010 000 |
| #newexperiences | 76 622 000 | 76 622 000 | 76 622 000 | 76 622 000 |

Five hashtags, thirteen days, not one digit of movement — so every delta rendered as `—`, for every
reader, on every day the block appeared.

Two further findings from the actor's raw output:

- **The `postsCount` field is wrong by 100× for `K`-scale tags.** It reports `4094000` next to its own
  `posts: "40.94 K"` (i.e. 40 940), while the `M`-scale tag converts correctly (`1.01 M` → `1010000`).
  We were storing bad numbers, hidden by the fact that the delta was always zero.
- **`postsPerDay` is empty** (`"—"`) and `difficulty` is blank, even though the actor advertises both.

**Rejected: swapping the actor.** The store has only two other stats actors, and *all of them read the
same Instagram hashtag page*, which publishes a rounded figure (`"40.94 K"`). A different scraper of a
frozen source returns the same frozen number. Confirming this would have cost a paid run on an account
already at $45/$100 for the month, to test a hypothesis the data already contradicts. Reconsider only if
a source with genuine daily counts appears.

**Rejected: counting from our own scrape.** Still capped at 12 posts per hashtag, exactly as when this was
[first considered](#hashtag-delta) — the cap is what made the stored-total approach necessary in the first
place.

**Removed:** the `Apify - Hashtag stats`, `Get counts`, `Split counts` and `Insert count row` nodes, the
delta computation in [build-request-node](/project/build-request-node.md), the block in
[email-format](/project/email-format.md), and the now-unread `hashtags[]` entry in the Config node. The
workflow drops from 17 nodes to 13 and becomes a single linear chain; ~$0.21/month and one HTTP round-trip
go with it. **Kept:** the data table and its 20 rows ([hashtag-counts-datatable](/project/hashtag-counts-datatable.md)) —
deleting measurements is irreversible, and they cost nothing where they are.

## <a id="meetapedia-router"></a>Free-tier router instead of the paid DeepSeek call (2026-08-18)
The user asked to replace the paid model call with the free AI access already built in their other
project: *"a ../meetapedia projektben találsz egy ingyenes ai hívási lehetőséget, azt tedd be a deepseek /
openai helyett"*. That project exposes its free-tier model router as an OpenAI-compatible gateway, so the
switch is a URL, a credential and `model: 'auto'` — see [meetapedia-router](/tech/meetapedia-router.md).

- **Why it was nearly free to do:** the gateway speaks the same wire format, so
  [parse-response-node](/project/parse-response-node.md) reads the same `choices[0].message.content` and
  the same `finish_reason`. No node was rewritten; one was added.
- **Not a rename.** A **new** node `AI - Meetapedia router` was inserted and the old `DeepSeek` node was
  disabled and unwired rather than re-pointed. Rollback is enabling one node and moving one connection,
  and the [rename trap](/tech/n8n.md#renaming) never comes into play — nothing references either node
  with `$('…')` (verified against the live workflow JSON, 2026-08-18).
- **Accepted: we no longer know which model answered.** `auto` picks per call from Groq / Cerebras /
  Gemini / Mistral / OpenRouter by measured quality and remaining quota. The response's `x_router` field
  records what actually served it, which is why it is worth reading before blaming the prompt.
- **Accepted: JSON mode is now best-effort.** Providers with `json_mode: false` never see
  `response_format`, so a fenced answer is normal. Handled by `jsonSlice` in
  [parse-response-node](/project/parse-response-node.md#jsonslice) — the alternative, pinning a
  `json_mode: true` provider, would give up the failover that makes the free tier reliable.
- **Accepted: `max_tokens` fell 16000 → 8000.** Gemini's free tier caps output at 8192; the old ceiling
  would have been rejected outright by part of the fleet. The answer needs a few hundred tokens; the rest
  is reasoning headroom.
- **Rejected: signing up for a free vendor tier directly** (Groq or Gemini with our own key). Same money,
  but a single provider has no failover, no quota ledger, and its own key to rotate — the router already
  owns all three, and its DeepSeek entry stays parked behind `allow_paid: false` so a spent free day
  cannot silently start billing.
- **Cost:** the model line drops from ~$0.09/month to **$0**. Apify was already ~99% of the bill, so this
  is not what makes the digest cheap — it removes the last recurring model cost and the last vendor key.
- **New dependency, and it is ours:** the digest now depends on the Meetapedia deployment being up. A 502
  or 429 is retried 3× by the node; a longer outage means no digest that morning, with the disabled
  DeepSeek node as the manual escape hatch.
- **The real exposure is quota, not uptime — and it was measured wrong at first.** Gateway calls spend the
  *same* daily ledger as the Meetapedia crawler. "One call a day is noise" is true about volume and false
  about availability: by 11:52 UTC on the switch day every free provider read `remaining: 0` and eight
  consecutive live calls returned `all providers rate limited`. The digest is not a heavy consumer, it is
  a **late** one — 06:00 Europe/Berlin is 04:00 UTC, four hours after the ledger's rollover, so it eats
  whatever the crawler left. The `continuous worker` deployed the same morning spends steadily instead of
  in a night block, which makes this worse, not better.
  **Decided 2026-08-18: change nothing yet and observe the 06:00 run.** Four hours of crawler spend is not
  twelve, so there is likely capacity at 04:00 UTC; the day's exhausted state was measured at midday and
  does not predict dawn. Rejected for now, in preference order if a morning does fail:
  **per-key quota** in the gateway (the ledger already counts per provider, so this is a column, not a
  redesign — and the gateway's own docs name it as the fix when one consumer starves another);
  **`allow_paid: true`** (works, but applies to every crawler call too, so it buys the digest's
  availability with the crawler's money); **rolling back to the DeepSeek node** — which on 2026-08-19 turned out
  **not to be a working escape hatch at all**: that account has been answering
  `402 Payment required` since 2026-08-15, so four digests had already failed there before the switch.
  A standby nobody exercises is a standby nobody can trust; see [runbook](/project/runbook.md).

## <a id="own-groq-key"></a>A dedicated free key instead of the shared gateway (2026-08-19)
The first 06:00 run on the router failed with `502 all providers rate limited` — **with 13,380 Groq and
1,099 Gemini requests still unspent that day**. Daily budget was never the binding constraint: the
Meetapedia crawler's continuous worker keeps every provider inside its **per-minute** window, so an
outside caller with one request a day finds the door shut essentially always.

Sharing a quota pool works when consumers are similar. Here they are not: the crawler is a
throughput job that will always absorb whatever headroom exists, and the digest needs *one* call at a
fixed minute. No routing policy fixes that asymmetry from the digest's side.

**Decision: the digest gets its own free-tier Groq key and calls Groq directly.** Groq's free tier is
14,400 requests/day against our one; the crawler cannot starve it, the digest cannot dent the crawler's
budget, and the call stays free — which was the point of the exercise. Rejected: reserving capacity for
one key inside the gateway (real work, and it buys the digest's availability out of the crawler's
throughput); `allow_paid` (spends money on every crawler call to fix one digest call); DeepSeek (not
free, and currently not even paid up).

The router work is **not wasted**: it proved the free-tier path end to end, and
[meetapedia-router](/tech/meetapedia-router.md) stays as the documented way to reach a whole fleet when
a job can tolerate scheduling.

**The model was chosen by measurement, on the real request.** The 30-candidate body from that morning's
failed run was replayed against every plausible Groq model
([groq](/tech/groq.md)): `gpt-oss-120b` holds the Hungarian line format, `gpt-oss-20b` drifts into
English and drops the engagement suffix despite scoring *higher* on Meetapedia's own leaderboard, and
`qwen3.6-27b` cannot hold JSON mode at all. `reasoning_effort: 'low'` beat `'medium'`, which spent 60%
more tokens to return a duplicate pick and a self-contradicting line. Replaying the **real** body is what
made this decidable — a synthetic three-candidate prompt had ranked them all as equally fine.

**The binding limit is tokens-per-minute, and it reshaped the request.** Groq's free tier counts
`prompt + max_tokens` against an 8000 TPM window *before* generating, so the inherited `max_tokens: 8000`
was a flat `413` — not a truncated answer, no answer. At a ~3400-token prompt the ceiling is now **4000**,
which is the largest value that still leaves the prompt room to grow. This makes `max_tokens` a
**capacity** parameter here, not just a safety margin, and it is the first thing to lower if the
candidate list ever grows.

## <a id="deepseek"></a>DeepSeek chat instead of Claude vision (2026-08-07)
The user moved the workflow to the **DeepSeek API** and dropped image analysis: *"nem érdekel a
képfeldolgozás már, azt kiszedheted belőle, csak a chat"*. Consequences, all accepted:

- **Model:** `deepseek-v4-pro` at `api.deepseek.com/chat/completions` — see [deepseek-api](/tech/deepseek-api.md).
  Chosen over `deepseek-v4-flash` because the task is a Hungarian judgement call and at one call per day
  the difference is under $0.05/month.
- **No JSON Schema.** DeepSeek offers only `response_format: {"type":"json_object"}`, so the shape moved
  into the prompt as a literal example and validation moved into
  [parse-response-node](/project/parse-response-node.md). This is a real downgrade from Anthropic's
  enforced `output_config.format` — the model *can* return the wrong shape now, so the code must assume it will.
- **Two ranking parameters died** with the images (`kepTipus`, `ratirtSzoveg`). The user chose to simply
  drop them rather than invent caption-based replacements, accepting flatter ordering and more
  engagement-decided ties. See [ranking-algorithm](/project/ranking-algorithm.md).
- **Cheaper and faster:** the model cost fell from ~$8/month to ~$0.09/month and a run lost the ~15 image
  downloads. See [runbook](/project/runbook.md). (Superseded 2026-08-18 by the
  [free-tier router](#meetapedia-router), which took the model line to $0 — the JSON-Schema and
  parameter-extraction consequences below still hold.)
- **Images stay in the email.** Only the *model* stopped seeing them; the
  [wsrv proxy](/tech/wsrv-image-proxy.md) is untouched.

## <a id="hashtag-delta"></a>Hashtag delta from a stored daily total (2026-08-07, superseded 2026-08-20)
> Superseded: the reasoning below is sound, but the data source it depends on turned out to be frozen.
> See [above](#drop-hashtag-counts).
The user asked for a block showing how many new posts appeared per hashtag since yesterday. The obvious
approach — counting fresh posts in what we already scrape — **cannot work**: we deliberately fetch only
12 posts per hashtag, so any count would cap at 12 and understate the truth.

Two alternatives were put to the user: raising the scrape limit (accurate, but ~$25–80/month, breaking
the ~$10 budget) or a stored daily total. The user chose the **stored total**. The main scrapers turned
out to expose no hashtag-level aggregate at all, so a third Apify node was added
(`apify~instagram-hashtag-analytics-scraper`, `postsCount`, ~$0.21/month) and the difference between
consecutive days is stored in [hashtag-counts-datatable](/project/hashtag-counts-datatable.md).

The actor's own `postsPerDay` was rejected in favor of our own difference: it is auditable and aligned to
our 06:00 schedule. **Instagram only** — TikTok has no equivalent total.

## Apify cost budget (~$10/month)
Apify's IG/TikTok scrapers are **pay-per-result** (~$0.0023/result IG, ~$0.003/result TikTok; no base
fee). At 50/hashtag × 5 hashtags × 2 platforms a run cost ~$1.33 → ~$40/mo. Target is **$10/mo**
(~$0.33/run), so `resultsLimit`/`resultsPerPage` were set to **12/hashtag** (~$0.32/run → ~$9.6/mo).
This is the post-scraper cost only; the hashtag-analytics node (~$0.21/mo) and the
[DeepSeek](/tech/deepseek-api.md) call (~$0.09/mo) are billed separately. Before 2026-08-07 the model
line was the Claude vision call at ~$8/mo. Full breakdown in the [runbook](/project/runbook.md#cost).

## 30-day window (2026-07-04)
The 7-day window plus a small result count kept surfacing the same viral posts. Raised the search
window to **30 days** for a fresher, more varied pool (result count later tuned down for cost, above).

## <a id="dedup-order"></a>Dedup readers must be in line, not parallel (2026-08-10)
The `canon()` work below was correct but **inert**: `Get sent` sat on a parallel branch, which n8n runs
*after* the main chain, so `$('Get sent')` threw inside Build request and a `try/catch` turned that into
an empty set. Every candidate passed the filter. Discovered only when the 2026-08-08 digest repeated 4 of
its 5 picks; the table then showed 21 URLs sent more than once, going back to mid-July.

Two lessons, both now enforced: **a `$('X')` reference requires X to be an ancestor**, and **never
`try/catch` a `$('...')` call into a default** — a swallowed wiring error is indistinguishable from
legitimately empty data. Build request also reports `sentRowCount` now, so the input
size is visible in every run. See [dedup-datatable](/project/dedup-datatable.md#silent-failure) and
[n8n](/tech/n8n.md#branch-order).

## Robust URL dedup (canon)
Repeats slipped through because the same post can be scraped in different URL formats
(`/reel/ABC` vs `/p/ABC`, trailing slash, query string). Dedup compares a **canonicalized** URL on
both sides (`canon()`), so format differences do not defeat it. See
[dedup-datatable](/project/dedup-datatable.md). This logic was fine; it just never received data until
the wiring fix above. Known limitation: *different* posts about the same viral event (reposts) share no
URL and are not deduped — content-level dedup was considered and not built.

## Prioritize genuine first-time signals for analysis
Only the top candidates by engagement were vision-analyzed, and high-engagement `#thatsafirst` posts skew
viral/fun — so few genuine firsts survived the filter (once a run returned a single item). Candidates are
now ranked for analysis by **first-time keyword signal first** (`first time`, `day one`, `először`, …),
then engagement, and the analyzed pool was raised **15 → 30**. This reliably yields ~5 genuine picks.

## Exclude fun/commercial non-firsts
A "5DX cinema" item was picked — a consumed entertainment product, not a personal first. The selection
prompt now explicitly excludes ads/promos, paid attractions/entertainment products, and generic "fun"
content, and prefers fewer but genuine picks (down to 0). See [ranking-algorithm](/project/ranking-algorithm.md).

## Discovery via Apify, not web search
Web search could not target Instagram/TikTok reliably, so discovery uses
[Apify](/tech/apify.md) hashtag scrapers, assembled by one [DeepSeek](/tech/deepseek-api.md) call.

## Execute Once on Apify nodes
The TikTok HTTP node fired **once per input item** (40 IG items → 40 concurrent Apify runs), exhausting
16 GB memory and ~$4 of credit. Fixed with `Execute Once` + `memory=4096` on both Apify nodes.

## <a id="images"></a>Claude images: base64, not URL — **superseded 2026-08-07**
*Historical.* Passing `source.type:"url"` (even via the wsrv proxy) returned **400 "This URL is disallowed
by the website's robots.txt file."** — Anthropic's fetcher honors robots.txt — so the build node downloaded
each image and sent `source.type:"base64"`. Obsolete since the [move to text-only DeepSeek](#deepseek):
no images are sent to any model. Kept because it explains why the code once looked the way it did.

## wsrv.nl proxy for email display
Raw Instagram `displayUrl` does not render in Gmail (hotlink protection / Google image proxy).
Routing through [wsrv.nl](/tech/wsrv-image-proxy.md) (`?url=…&w=360&output=jpg`) makes both IG and
TikTok images render **and** gives consistent sizing.

## Deterministic ranking in code
The user wanted explicit, tunable ordering. The model extracts parameters (from the caption; originally
from text **and** image); the [score and sort](/project/ranking-algorithm.md) are computed in code, so
weights are auditable and stable. This choice is what made the vision removal cheap — only the parameter
*sources* changed, not the scoring machinery.

## Prompt language & examples
Accent-less prompts produced accent-less output, and negative "Először" examples got copied verbatim.
Fix: write the prompt in **accented Hungarian** with **positive** activity-first examples only.

## Remove the n8n footer
Minimalist requirement → Gmail node "Append n8n Attribution" turned off.

## No image-analysis cache
Considered caching vision results per URL to avoid re-analyzing recurring candidates. The user
**declined** it (2026-07-04). Do not build it; see [dedup-datatable](/project/dedup-datatable.md).

## Schedule 06:00
Changed from 07:00 to **06:00** on request; the Schedule node was renamed to "Every day 06:00" to match.
