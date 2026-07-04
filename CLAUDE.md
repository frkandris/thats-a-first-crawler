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

- `project/` — everything specific to the *That's a First Digest* system.
- `nodes/` — (reserved for future) one page per n8n node if the pipeline page grows too large.
- `tech/` — reusable knowledge about the underlying tools (n8n, Apify, Claude, image proxy).
- `format/` — meta: the OKF spec and the LLM-wiki pattern that govern this repo.

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

- Model: `claude-opus-4-8` (vision).
- Schedule: **daily 06:00** Europe/Berlin (Schedule node "Every day 06:00").
- Recipient **and** sender: `andris@strt.hu`.
- Claude vision images must be **base64**, never URL (robots.txt).
- Secrets (Apify token, Anthropic key) are never printed; the human pastes them into n8n.
