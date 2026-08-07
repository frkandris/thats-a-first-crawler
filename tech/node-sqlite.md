---
type: Tool
title: node:sqlite
description: Node's built-in SQLite module — the website's entire persistence layer, with zero dependencies.
resource: https://nodejs.org/api/sqlite.html
tags: [sqlite, database, node, storage]
timestamp: 2026-08-07T00:00:00Z
---

The [website](/project/website.md) stores everything in SQLite through Node's **built-in** `node:sqlite`
module (Node 26) — no `better-sqlite3`, no ORM, no dependency at all. File: `web/data/app.db`
(gitignored). Schema and seeding: `web/lib/db.ts` (181 lines).

## Usage pattern

```ts
import { DatabaseSync } from "node:sqlite";

// One shared connection kept on globalThis so Next's dev hot reload
// does not open a new handle on every edit.
const globalForDb = globalThis as unknown as { __tafDb?: DatabaseSync };
```

`DatabaseSync` is synchronous — fine for a local-first admin tool with a handful of rows, and it removes
all async plumbing from the query layer (`web/lib/queries.ts`).

The `globalThis` singleton is the standard Next-dev workaround: without it, every hot reload leaks a
connection. Same trick people use for Prisma clients.

## Tables

`activities` (the 50-item curated collection, bilingual columns), `discoveries` (pipeline output shape +
`status` with a `CHECK` constraint over `new/selected/contacted/featured/skipped`), `subscribers`,
`newsletter_issues`. Full column list in `web/lib/db.ts`; product-level description in
[website](/project/website.md).

## Migrations

There is no migration framework. `db.ts` runs `CREATE TABLE IF NOT EXISTS` plus a small **dev migration**
that drops and reseeds the old monolingual `activities` table and adds missing columns. This is
acceptable only because the app is **not deployed** and the data is seed data. Before any deploy this
needs a real migration story — see the open ends in [website](/project/website.md).

## Caveat

WAL sidecar files (`app.db-shm`, `app.db-wal`) sit next to the database; they are part of the local
working state, not something to commit.

# Citations

- Connection + schema: `web/lib/db.ts:1-40`.
- Node docs: https://nodejs.org/api/sqlite.html
