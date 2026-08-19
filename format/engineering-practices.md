---
type: Convention
title: Engineering practices
description: Which software-engineering practices this repo actually implements, how, and which ones were deliberately skipped for a one-workflow project.
resource: https://google.github.io/eng-practices/
tags: [practices, ci, testing, review, meta]
timestamp: 2026-08-19T00:00:00Z
---

Practices adopted from [Google's engineering practices](https://google.github.io/eng-practices/) and
[martinfowler.com](https://martinfowler.com/) (read 2026-08-19), narrowed to what a single-workflow,
LLM-maintained project can actually sustain. **Adopting a practice means wiring it into a command that
runs — not writing down that we believe in it.**

## The problem these fix

Until 2026-08-19 the pipeline's logic lived **only inside the n8n web UI**. No diff, no review, no test,
no history. Two of this project's worst incidents are direct consequences:

- [dedup passed everything through for weeks](/project/dedup-datatable.md#silent-failure) — a wiring
  change turned a reader empty and a `try/catch` hid it. A test would have caught it in seconds.
- `max_tokens: 4000` shipped on 2026-08-19 and was **wrong for the worst case** (a ~4600-token prompt
  would 413 on Groq). It was found by the *first run of the new test suite*, not in production.

## What is implemented

| Practice | Source | Here |
|---|---|---|
| Everything in version control | Fowler, *Continuous Integration* | `scripts/sync_nodes.py` mirrors the live Code nodes into `nodes/*.js`. The workflow stays the system of record; the repo gets diffable history |
| Self-testing code | Fowler | `tests/*.test.mjs` (`node --test`) run the **real** node source through a fake n8n runtime (`tests/harness.mjs`) — not a re-typed copy, which would only prove the copy works |
| Automate the build | Fowler | `scripts/check.sh` — one command: drift check, tests, wiki lint |
| Keep the build fast | Fowler ("ten minutes") | The suite runs in **under a second**; no network, no secrets |
| Fail the build on any failure | Fowler ("99.9% green is still red") | `check.sh` exits non-zero on the first failing stage; CI runs it on every push |
| Documentation updated with behaviour | Google, *What to look for* | `scripts/lint_wiki.py` fails when `CLAUDE.md`'s invariants no longer match `nodes/` |
| Comments say *why*, not *what* | Google | The node comments carry the incident that set each value (`max_tokens`, the `$('Get sent')` throw) |
| Small, self-contained changes | Google, *Small CLs* | One concern per commit, wiki updates shipped **with** the change that caused them ([CLAUDE.md](/CLAUDE.md)) |
| Descriptive change messages | Google, *CL descriptions* | First line = what changed; body = *why*, including what was rejected |

## What the tests actually assert

Not coverage for its own sake — each test is a past or plausible incident:

- **`$('Get sent')` missing must throw**, never fall back to "nothing sent yet" (the dedup incident).
- **Canonical dedup**: `instagram.com/reel/X?igshid=…` and `www.instagram.com/p/X/` are the same post.
- **The worst-case prompt plus `max_tokens` stays inside Groq's 8000 TPM window** ([groq](/tech/groq.md#tpm)).
- **The request stays text-only** — no image URL may reach the model body.
- **Truncation is distinguishable from an empty selection** (`finish_reason: length` + empty content).
- **A fenced or prose-wrapped answer still parses** ([jsonSlice](/project/parse-response-node.md#jsonslice)).
- **Ranking is deterministic**: `csoportos+oktatos` (150) > `csoportos` (100) > `felnott` (20).

## What was deliberately skipped

- **Deployment pipeline / staged builds** (Fowler). There is no deploy — n8n *is* production, and a PUT to
  its API is the release. The equivalent guard is `sync_nodes.py --check`, which fails CI when the repo
  copy and the live workflow disagree.
- **Two-person code review** (Google). This is a single-maintainer project; the reviewer's checklist is
  applied by the assistant against its own diff instead, and the *reviewer* discipline that survives is
  the one that catches drift automatically — the linter.
- **Trunk-based CI on every push to a shared mainline** (Fowler). There is one branch and one author, so
  "everyone commits to mainline daily" is trivially satisfied; the value taken from CI is the
  **self-testing build**, not the integration cadence.
- **Coverage targets.** With four small files, a coverage number would measure the tests' surface area,
  not the risk they cover. The incident list above is the coverage criterion.

## How to change node logic

1. Edit in n8n (the UI is the source of record — it is what runs at 06:00).
2. `python3 scripts/sync_nodes.py` to pull the change into `nodes/`.
3. `bash scripts/check.sh` — tests and lint must pass.
4. Commit the node change **and** the wiki update together.

Editing `nodes/*.js` by hand is a dead end: the file header says so, and the next sync overwrites it.
