---
type: Tool
title: n8n
description: The self-hosted workflow-automation platform that runs the digest.
resource: https://<n8n-host>
tags: [n8n, automation, platform]
timestamp: 2026-08-20T00:00:00Z
---

[n8n](https://n8n.io) is a node-based workflow-automation tool. STRT runs a self-hosted instance.
The [pipeline](/project/pipeline.md) is one n8n workflow.

## Concepts used here

- **Trigger nodes** — a Schedule Trigger fires the daily run (interval Days, hour/minute).
- **HTTP Request nodes** — call Apify and the [Meetapedia router](/tech/meetapedia-router.md); auth via generic credentials
  ([credentials](/project/credentials.md)). `Execute Once` (Settings tab) runs the node a single time
  regardless of input item count — critical for the [Apify](/tech/apify.md) nodes.
- **Code nodes** — JavaScript, "Run Once for All Items". Have `this.helpers.httpRequest`, `Buffer`,
  top-level `await` (n8n wraps the body in an async function). Reference other nodes with
  `$('Node Name').all()` / `.first().json`.

## <a id="branch-order"></a>A parallel branch runs at the END of the run

This one cost weeks of silent breakage. With `executionOrder: v1`, n8n walks the **main chain to
completion first**, then comes back for the other branches of a fork. A "read a table in parallel" node
therefore executes **last**, not alongside.

Measured on a real run (2026-08-08), offsets from the first node:

```
+     2ms  Apify - Instagram
+135656ms  Build request        ← calls $('Get sent') here
+239678ms  Get sent             ← but it only runs now
```
*(`Get counts` was in this trace too; that node was removed with the
[hashtag counts](/project/decisions.md#drop-hashtag-counts) on 2026-08-20.)*

`$('Node')` on a node that has **not executed yet throws**. Wrapped in `try {} catch {}` — as our code
was — it silently yields an empty list, so a filter built on it passes everything through and *looks*
fine. Dedup was dead for weeks this way; see [dedup-datatable](/project/dedup-datatable.md).

**Rule: if a Code node calls `$('X')`, then X must be an ancestor in the same chain.** Wire readers
**in line** ahead of the consumer rather than on a parallel branch, and set `Execute Once` on them so an
upstream node emitting many items does not multiply the reads. Never `try/catch` a `$('...')` call into
a default value — let it throw, or throw a clearer error.

## <a id="renaming"></a>Renaming a node breaks `$('...')` references

`$('Node Name')` is resolved **by display name at runtime**. Renaming a node does **not** update the
string inside other nodes' code, and nothing warns you — the workflow saves and looks healthy. It fails
only when that node executes, with a confusing message:

```
Cannot assign to read only property 'name' of object 'Error: Referenced node doesn't exist'
```

This bit us on 2026-08-07: `Parse Claude` → `Parse response` left `Split picks` pointing at the old
name, so the digest email went out but the dedup rows were never written.

**Always grep every Code node for `$('<old name>')` after a rename.** One-liner against the API:

```
$('...') references, checked against the live node list
→ GET /api/v1/workflows/<id>, regex \$\(\s*['"]([^'"]+)['"]\s*\) over each node's parameters
```
- **Data Tables** — lightweight key/value tables; Get (Return All) and Insert (Map Automatically).
  Two are used: [dedup](/project/dedup-datatable.md) and
  [hashtag counts](/project/hashtag-counts-datatable.md).
- **IF nodes** — branch on an expression (`Has picks?`).
- **Gmail node** — OAuth2; sends HTML mail. Options → "Append n8n Attribution" adds a footer (turned off).

## Editing conventions (this instance)

- Import a workflow by pasting JSON onto the canvas (Cmd+V); the REST API returns 401 from an isolated
  browser context.
- Disable/enable a node with **d**; fit view; delete option rows via their trash icon.
- **Publish** creates a version and activates the schedule; edits need re-publishing.
- Workflow **Settings** → "Save successful production executions" controls execution logging.

## This workflow

- Runs as a single workflow in a Personal project. See [runbook](/project/runbook.md).
