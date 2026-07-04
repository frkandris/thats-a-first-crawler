---
type: Specification
title: Open Knowledge Format (OKF) v0.1
description: The minimalist markdown+YAML knowledge format this wiki conforms to.
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
tags: [format, okf, spec, knowledge]
timestamp: 2026-07-04T00:00:00Z
---

**OKF** (Google Cloud, knowledge-catalog) represents knowledge as *"a directory of markdown files with
YAML frontmatter."* This wiki conforms to **v0.1**; see [CLAUDE.md](/CLAUDE.md) for how we apply it.

## Bundle structure

```
bundle/
├── index.md          # optional directory listing (reserved)
├── log.md            # optional update history (reserved)
├── <concept>.md      # a concept document
└── <subdir>/…        # nested concepts, each with its own index.md
```

**Concept ID** = file path minus `.md` (e.g. `tables/users.md` → `tables/users`).

## Frontmatter

- **Required:** `type` — short kind string (e.g. `BigQuery Table`, `Playbook`, `Metric`). Not centrally
  registered; consumers must tolerate unknown types.
- **Recommended:** `title`, `description` (one sentence), `resource` (URI of the underlying asset),
  `tags` (list), `timestamp` (ISO 8601).
- Producers may add custom keys; consumers must preserve unknown keys.

## Body

Standard markdown, with optional conventional sections: `# Schema`, `# Examples`, `# Citations`.

## Cross-linking

Bundle-relative (recommended) `[text](/path/to/concept.md)` or relative `[text](./concept.md)`.
Links assert relationships; the *kind* of relationship is conveyed in prose.

## Reserved filenames

- `index.md` — directory listing with progressive disclosure.
- `log.md` — chronological history, date-grouped, `YYYY-MM-DD`.

## Conformance (v0.1)

A bundle conforms if: every non-reserved `.md` has parseable frontmatter with a non-empty `type`, and
reserved files follow their structures when present. Consumers must tolerate missing optional fields,
unknown types/keys, broken links, and absent index files.

# Examples

```yaml
# datasets/sales.md
---
type: BigQuery Dataset
title: Sales
description: Sales-related tables for retail.
resource: https://console.cloud.google.com/bigquery?p=acme&d=sales
tags: [sales]
timestamp: 2026-05-28T00:00:00Z
---
The sales dataset contains [orders](/tables/orders.md) and [customers](/tables/customers.md).
```

# Citations

- Spec: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
- Applied by the [LLM wiki pattern](/format/llm-wiki-pattern.md) in this repo.
