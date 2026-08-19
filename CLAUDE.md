# CLAUDE.md — Wiki schema & workflows

This file is the **schema layer** of the wiki (Karpathy's third layer). It tells an LLM agent how
this knowledge base is structured and how to maintain it. It is not itself a concept document.

## Format

This bundle conforms to [OKF v0.1](/format/okf.md):

- Every non-reserved `.md` file has YAML frontmatter with a **required `type`** field.
- Recommended frontmatter: `title`, `description`, `resource`, `tags`, `timestamp` (ISO 8601).
- Concept ID = path minus `.md` (e.g. `project/pipeline.md` → `project/pipeline`).
- Reserved filenames: `index.md` (catalog) and `log.md` (history).
- Cross-link with **bundle-relative** links: `[pipeline](/project/pipeline.md)`.

## Directory conventions

- `project/` — everything specific to the *That's a First Digest* system and its website.
- `nodes/` — (reserved for future) one page per n8n node if the pipeline page grows too large.
- `tech/` — reusable knowledge about the underlying tools (n8n, Apify, the LLM gateway, image proxy, and the
  website stack: Next.js, node:sqlite, newsletter delivery, PDFKit).
- `format/` — meta: the OKF spec and the LLM-wiki pattern that govern this repo.

## How to write a page

From the [LLM-wiki pattern](/format/llm-wiki-pattern.md); these are binding, not stylistic:

- **One concept per page, ~200 lines max.** Outgrown a page? Split it.
- **Answer first, sources second.** State the fact at the top; provenance below.
- **Provenance for every non-obvious claim** — `file:line`, commit SHA, or a dated vendor-doc URL.
  Vendor facts get the date they were read, because vendor docs change.
- **Dates are absolute `YYYY-MM-DD`.** Never "recently" or "last week".
- **A smaller true wiki beats a padded one.** Do not pad a page to look thorough.
- **Record what was decided *and rejected*, with the reason** — a rejected option that is not written
  down gets re-proposed every few months.
- **Supersede, don't silently delete.** When a decision is reversed, mark the old one superseded and say
  why (see the `#images` entry in [decisions](/project/decisions.md)); delete only pages describing
  things that no longer exist at all.
- **Wiki updates ship in the same commit as the change that caused them.**

## Working on the pipeline code

The Code nodes are mirrored into `nodes/*.js` by `scripts/sync_nodes.py` and covered by
`tests/*.test.mjs`. See [engineering-practices](/format/engineering-practices.md) for why.

- **n8n is the system of record.** Edit there, then `python3 scripts/sync_nodes.py` to pull the change
  into the repo. Editing `nodes/*.js` by hand achieves nothing — the next sync overwrites it.
- **`bash scripts/check.sh` before every commit**: node syntax, tests, wiki lint. Add `--live` to also
  assert the repo copy still matches the running workflow.
- **A behaviour change needs a test.** The bar is not coverage; it is that every past incident has one
  test that would have caught it.
- Do not "raise `max_tokens` for safety" — read the invariant below first; it is a capacity limit.

## The three operations

### Ingest
When a new source arrives (a workflow change, a new Apify actor, a design decision):
1. Identify which concept page(s) it touches; create a new page if it is a new concept.
2. Update the page body and `timestamp`; keep the `description` a single accurate sentence.
3. Fix/add cross-references in both directions.
4. Append a dated entry to [log.md](/log.md).

### Query
Answer questions against the wiki, not the raw sources. If an answer is durable and reusable,
promote it to a concept page (or a `# Examples`/`# Citations` section) and link it from [index.md](/index.md).

### Lint
Health-check periodically:
- Frontmatter present with non-empty `type` on every non-reserved page.
- No contradictions between pages (e.g. schedule time, model id, recipient).
- No orphans (every page linked from at least one `index.md` or sibling).
- No stale timestamps on pages whose subject changed.
- No broken bundle-relative links.

## Ground-truth invariants (guard against drift)

- Model: `openai/gpt-oss-120b` via `api.groq.com/openai/v1/chat/completions` on **our own free-tier key**,
  **text-only** (since 2026-08-19). Pinned deliberately and chosen by measurement against the real
  request. The shared Meetapedia gateway (2026-08-18) and the paid DeepSeek node are both disabled but
  documented; neither is a working fallback today.
- No images are sent to any model. Image URLs exist only for email rendering (wsrv proxy).
- **No JSON Schema anywhere in the fleet** — the shape is a literal example in the prompt, and
  [parse-response-node](/project/parse-response-node.md) validates every field. Never assume the
  response matches the shape. Providers with `json_mode: false` never even receive `response_format`,
  so a markdown-fenced answer is normal; `jsonSlice` strips it before parsing.
- `max_tokens` is **3000** and is a **capacity** parameter, not a safety margin: Groq's free tier counts
  `prompt + max_tokens` against one 8000 tokens-per-minute window *before* generating, so an oversized
  ceiling is a `413`, never a truncated answer. Size it against the **worst-case** prompt (30 candidates ×
  300-char captions ≈ 4600 tokens), not the observed one — 4000 passed in production and still would have
  failed on a long-caption day. `tests/build-request.test.mjs` asserts this; it is also the reasoning
  budget (measured need: 805 tokens).
- Schedule: **daily 06:00** Europe/Berlin (Schedule node "Every day 06:00").
- Recipient and sender: configured in the Config node and the Gmail credential.
- The hashtag-counts branch must **never** be gated on `Has picks?`, **and must run first**. n8n runs
  same-output targets in list order, so `Split counts` has to precede the model node in `Build request`'s
  output list: with the model first, four failed mornings wrote no totals at all and every delta read 0
  for 11 days. Not being gated on `Has picks?` was necessary but not sufficient.
  `scripts/check_wiring.py` asserts both.
- **Any node referenced as `$('X')` must be an ancestor of the referencing node.** n8n runs parallel
  branches at the *end* of a run, so a "parallel read" is empty when the main chain asks for it. Never
  wrap a `$('...')` call in `try/catch` with a default — that hides a wiring bug as legitimate empty
  data, which is exactly how dedup stayed broken for weeks.
- Secrets (Apify token, `GROQ_API_KEY`, `ROUTER_API_KEY`, DeepSeek key) are never printed. Any key that
  reaches a chat transcript is compromised and must be rotated — this has happened twice.
