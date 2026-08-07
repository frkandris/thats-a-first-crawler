---
type: Tool
title: Newsletter delivery
description: Why newsletter sending is an adapter layer — Substack has no public API, Buttondown does.
resource: https://docs.buttondown.com
tags: [newsletter, substack, buttondown, api, adapter]
timestamp: 2026-08-07T00:00:00Z
---

The [website](/project/website.md) builds a monthly issue and then hands it to a **publisher adapter**.
The abstraction exists because of one hard constraint.

## Substack has no official public API

Verified **2026-07**. Only reverse-engineered wrappers exist, and they can break at any time. So the
system never bets on a platform: the issue is composed and rendered locally, and *delivery* is a
swappable layer (`web/lib/newsletter/publishers/types.ts:3-14`).

## The adapter interface

```ts
export interface Publisher {
  name: string;
  publish(issue: RenderedIssue): Promise<PublishResult>;
}
// PublishResult = { ok: boolean; message: string; url?: string }
```

| Adapter | File | Behavior |
|---|---|---|
| `manual` | `publishers/manual.ts` | Exports HTML for pasting into any platform's editor. **This is the supported path for Substack.** |
| `buttondown` | `publishers/buttondown.ts` | Real documented API. `POST https://api.buttondown.com/v1/emails` with `Authorization: Token <key>`, creates the issue as a **draft**; sending is a second step (UI, or `status: "about_to_send"`). |

Buttondown needs `BUTTONDOWN_API_KEY` in the environment; without it the adapter returns a helpful
failure rather than throwing (`publishers/buttondown.ts:17-23`). Keys live in env vars, never in the repo
— same rule as the [pipeline credentials](/project/credentials.md).

## Send timing

Issues go out on the **first Wednesday** of the month, and the copy counts down the weeks to the **last
Wednesday** (the actual meetup date). All date math is in `web/lib/dates.ts`
(`firstWednesdayOfMonth`, `lastWednesdayOfMonth`, `weeksUntilLastWednesday`, `nextLastWednesday`).

An issue is keyed by **month + language**: HU and EN are separate issues with a
`UNIQUE(month, locale)` index, each rendered in its own language.

## Open decision

Which platform actually gets used — a documented-API platform like Buttondown (full automation) versus
the manual Substack flow — is still open. See [website](/project/website.md).

# Citations

- Adapter rationale, verbatim in the source: `web/lib/newsletter/publishers/types.ts:3-14`.
- Buttondown request shape: `web/lib/newsletter/publishers/buttondown.ts:25-36`.
