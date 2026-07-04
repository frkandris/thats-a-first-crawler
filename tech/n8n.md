---
type: Tool
title: n8n
description: The self-hosted workflow-automation platform that runs the digest.
resource: https://n8n.strt.hu
tags: [n8n, automation, platform]
timestamp: 2026-07-04T00:00:00Z
---

[n8n](https://n8n.io) is a node-based workflow-automation tool. STRT runs it at `https://n8n.strt.hu`.
The [pipeline](/project/pipeline.md) is one n8n workflow.

## Concepts used here

- **Trigger nodes** — a Schedule Trigger fires the daily run (interval Days, hour/minute).
- **HTTP Request nodes** — call Apify and Anthropic; auth via generic credentials
  ([credentials](/project/credentials.md)). `Execute Once` (Settings tab) runs the node a single time
  regardless of input item count — critical for the [Apify](/tech/apify.md) nodes.
- **Code nodes** — JavaScript, "Run Once for All Items". Have `this.helpers.httpRequest`, `Buffer`,
  top-level `await` (n8n wraps the body in an async function). Reference other nodes with
  `$('Node Name').all()` / `.first().json`.
- **Data Tables** — lightweight key/value tables; Get (Return All) and Insert (Map Automatically).
  Used for [dedup](/project/dedup-datatable.md).
- **IF nodes** — branch on an expression (`Has picks?`).
- **Gmail node** — OAuth2; sends HTML mail. Options → "Append n8n Attribution" adds a footer (turned off).

## Editing conventions (this instance)

- Import a workflow by pasting JSON onto the canvas (Cmd+V); the REST API returns 401 from an isolated
  browser context.
- Disable/enable a node with **d**; fit view; delete option rows via their trash icon.
- **Publish** creates a version and activates the schedule; edits need re-publishing.
- Workflow **Settings** → "Save successful production executions" controls execution logging.

## This workflow

- Id `JEHhYDEEklYRoIHb`, Personal project `fu7pZOjdTaVgVqZ6`. See [runbook](/project/runbook.md).
