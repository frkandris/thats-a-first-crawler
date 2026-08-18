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

- Model: `auto` via `meetapedia.com/v1/chat/completions`, **text-only** (since 2026-08-18). `auto` is a
  routing policy over free-tier providers, not a model name — *which* model answers is in the response's
  `x_router` field and changes run to run. The paid `deepseek-v4-pro` node is disabled, not deleted.
- No images are sent to any model. Image URLs exist only for email rendering (wsrv proxy).
- **No JSON Schema anywhere in the fleet** — the shape is a literal example in the prompt, and
  [parse-response-node](/project/parse-response-node.md) validates every field. Never assume the
  response matches the shape. Providers with `json_mode: false` never even receive `response_format`,
  so a markdown-fenced answer is normal; `jsonSlice` strips it before parsing.
- `max_tokens` is **8000** and must not exceed 8192 — part of the free fleet rejects a larger ceiling.
  It is a *reasoning* budget, not an output-size one.
- Schedule: **daily 06:00** Europe/Berlin (Schedule node "Every day 06:00").
- Recipient and sender: configured in the Config node and the Gmail credential.
- The hashtag-counts branch must **never** be gated on `Has picks?` — today's totals are written even on
  no-email days, or the next delta breaks.
- **Any node referenced as `$('X')` must be an ancestor of the referencing node.** n8n runs parallel
  branches at the *end* of a run, so a "parallel read" is empty when the main chain asks for it. Never
  wrap a `$('...')` call in `try/catch` with a default — that hides a wiring bug as legitimate empty
  data, which is exactly how dedup stayed broken for weeks.
- Secrets (Apify token, `ROUTER_API_KEY`, DeepSeek key) are never printed; the human pastes them into n8n.
