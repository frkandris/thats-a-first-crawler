# That's a First — LLM Wiki

![format: OKF v0.1](https://img.shields.io/badge/format-OKF%20v0.1-2ea44f)
![pattern: LLM Wiki](https://img.shields.io/badge/pattern-LLM%20Wiki-8A2BE2)
![runs on: n8n](https://img.shields.io/badge/runs%20on-n8n-EA4B71)
![LLM: Claude Opus 4.8](https://img.shields.io/badge/LLM-Claude%20Opus%204.8-D97757)
![status: live daily 06:00](https://img.shields.io/badge/status-live%20daily%2006%3A00-brightgreen)
![docs: 20 concept pages](https://img.shields.io/badge/docs-20%20concept%20pages-blue)

An **LLM-maintained knowledge base** for STRT's *"That's a First Digest"* project — a daily
[n8n](/tech/n8n.md) workflow that scrapes Instagram/TikTok and emails a Hungarian digest of people
trying something for the **first time**.

The wiki is written in the [Open Knowledge Format (OKF)](/format/okf.md) and follows Andrej Karpathy's
[LLM Wiki pattern](/format/llm-wiki-pattern.md): a directory of interlinked markdown files with YAML
frontmatter that an LLM keeps summarized and current, so humans read the wiki instead of the raw sources.

## Start here

| | |
|---|---|
| 🗂️ [index.md](/index.md) | the catalog — browse every page by category |
| 🕑 [log.md](/log.md) | chronological history of ingests / queries / lint passes |
| ⚙️ [CLAUDE.md](/CLAUDE.md) | the *schema* layer — conventions and the ingest/query/lint workflows |
| 🚀 [project/thats-a-first-digest.md](/project/thats-a-first-digest.md) | the project this wiki documents |

## Structure

```
README.md   CLAUDE.md (schema)   index.md   log.md
project/   overview · pipeline · ranking-algorithm · email-format ·
           build-request-node · parse-claude-node · dedup-datatable ·
           credentials · runbook · decisions
tech/      n8n · apify · claude-vision-api · wsrv-image-proxy
format/    okf · llm-wiki-pattern
```

Every non-reserved page carries `type`, `title`, `description`, `resource`, `tags`, `timestamp`
frontmatter and links to siblings with bundle-relative `/path.md` links.

## Three layers (Karpathy)

1. **Raw sources** (immutable): the n8n workflow JSON, node code, Apify/Claude/Gmail docs, chat history.
2. **The wiki** (this repo, LLM-owned): summaries, concept pages, cross-references.
3. **The schema** ([CLAUDE.md](/CLAUDE.md)): structure, conventions, workflows.

## Maintaining it

Follow the operations in [CLAUDE.md](/CLAUDE.md):
**Ingest** new sources into the pages they touch, **Query** the wiki (promote durable answers to pages),
and **Lint** for contradictions, staleness, orphans, and broken links. Append every change to
[log.md](/log.md).

## Browsing

Open the folder in [Obsidian](https://obsidian.md) for live link navigation, or read it on GitHub.
