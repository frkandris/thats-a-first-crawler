---
type: Pattern
title: LLM Wiki pattern
description: Karpathy's pattern of an LLM incrementally building and maintaining a persistent interlinked markdown wiki.
resource: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
tags: [pattern, llm, wiki, knowledge]
timestamp: 2026-07-04T00:00:00Z
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

# Citations

- Gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Format used here: [OKF](/format/okf.md).
