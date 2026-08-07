---
type: Pattern
title: LLM Wiki pattern
description: Karpathy's pattern of an LLM incrementally building and maintaining a persistent interlinked markdown wiki.
resource: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
tags: [pattern, llm, wiki, knowledge]
timestamp: 2026-08-07T00:00:00Z
---

Andrej Karpathy's **LLM Wiki** pattern: instead of RAG re-synthesizing from raw sources on every query,
an LLM **incrementally builds and maintains a persistent wiki** — a structured, interlinked collection of
markdown pages that sits between you and the raw sources and compounds over time. Synthesis happens once
and is kept current. This repo is an instance, stored in [OKF](/format/okf.md).

## Three layers

1. **Raw sources** (immutable) — the workflow JSON, node code, vendor docs, chat history.
2. **The wiki** (LLM-owned) — generated pages: summaries, concept pages, cross-references (this repo).
3. **The schema** (config) — [CLAUDE.md](/CLAUDE.md): structure, conventions, workflows.

## Three operations

- **Ingest** — process a new source, update the pages it touches, maintain cross-references, append to
  [log.md](/log.md).
- **Query** — answer from the wiki; promote durable answers to new pages.
- **Lint** — health-check for contradictions, staleness, orphans, missing/broken links.

## Special files

- **index.md** — content-oriented catalog by category with one-line summaries.
- **log.md** — append-only chronological record.

## Why it works

It shifts the tedious bookkeeping (cross-references, consistency) to the LLM, which does not get bored or
forget — the exact maintenance burden that makes humans abandon wikis. Humans keep curation, direction,
and critical thinking.

## Optional tooling

Obsidian (live browsing), hybrid search (SQLite FTS5), **git** for version control and audit trails,
MCP servers for agent integration.

## Page discipline (from the bootstrap prompt)

Karpathy's gist describes *what* the pattern is; the `kondfox/ai-utils` **bootstrap prompt** adds the
operational discipline that keeps a wiki from rotting into padding. Adopted here on 2026-08-07:

- **One concept per page**, roughly **200 lines maximum**. If a page outgrows that, split it — this is
  what `nodes/` is reserved for in [CLAUDE.md](/CLAUDE.md).
- **Answer first, sources second.** The top of a page states the fact; provenance follows.
- **Provenance is mandatory for non-obvious claims** — `file:line`, commit SHA, PR number, or a dated
  vendor-doc URL. A claim nobody can re-check is a claim nobody can trust later.
- **Dates are `YYYY-MM-DD`**, always absolute, never "last week".
- **Conservative bias: a smaller true wiki beats a padded one.** Do not write a page to look thorough.
- **Wiki updates ship with the change that caused them** — same commit, not a later cleanup pass.
- **The schema may evolve, but only explicitly and rarely.**

That prompt also sequences a *from-scratch* bootstrap (investigate the project → scaffold `CLAUDE.md` →
parallel research tasks → wire into the root instruction file → optional CI capture). This repo is past
that stage: it was bootstrapped on 2026-07-04 and is maintained through the three operations instead.
Its one structural difference is link syntax — it uses Obsidian-style `[[wiki-links]]`, while this bundle
uses [OKF](/format/okf.md) bundle-relative markdown links. We keep OKF.

# Citations

- Gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Bootstrap prompt: https://github.com/kondfox/ai-utils/blob/main/seeds/llm-wiki-seed-prompt.md (read 2026-08-07).
- Format used here: [OKF](/format/okf.md).
