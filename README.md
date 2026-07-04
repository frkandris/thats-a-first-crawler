# That's a First — LLM Wiki

An **LLM-maintained knowledge base** for STRT's *"That's a First Digest"* project, written in the
[Open Knowledge Format (OKF)](/format/okf.md) and following Andrej Karpathy's
[LLM Wiki pattern](/format/llm-wiki-pattern.md).

It is a directory of markdown files with YAML frontmatter. Every non-reserved `.md` file is a
**concept document**; the LLM keeps them summarized, interlinked, and current so humans read the
wiki instead of the raw sources.

## Where to start

- [index.md](/index.md) — the catalog (browse by category)
- [log.md](/log.md) — chronological history of ingests / queries / lint passes
- [CLAUDE.md](/CLAUDE.md) — the *schema* layer: conventions and the ingest/query/lint workflows
- [That's a First Digest](/project/thats-a-first-digest.md) — the project this wiki documents

## Three layers (Karpathy)

1. **Raw sources** (immutable): the n8n workflow JSON, node code, Apify/Claude/Gmail docs, chat history.
2. **The wiki** (this repo, LLM-owned): summaries, concept pages, cross-references.
3. **The schema** ([CLAUDE.md](/CLAUDE.md)): structure, conventions, workflows.

## Browsing

Open the folder in [Obsidian](https://obsidian.md) for live wikilink navigation, or read on GitHub.
`type`, `tags` and `timestamp` frontmatter make the pages filterable and sortable.
