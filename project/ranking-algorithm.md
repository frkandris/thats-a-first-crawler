---
type: Algorithm
title: Ranking algorithm
description: Deterministic scoring and sort that orders the daily picks from caption-derived parameters extracted by the model.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [ranking, scoring]
timestamp: 2026-08-18T00:00:00Z
---

Ranking is **deterministic and done in code** ([parse-response-node](/project/parse-response-node.md)), not
left to the model's judgement. The model only *extracts parameters* per candidate (from the caption); the
score and order are computed from them. That is also why swapping the model — Claude → DeepSeek → the
[free-tier router](/tech/meetapedia-router.md) — never changed the ordering rules.

## Parameters (per pick)

| Field | Meaning | Source |
|---|---|---|
| `csoportos` | done together / as a group | caption |
| `oktatos` | learned from a coach/teacher/host/guide | caption |
| `felnott` | the person is an adult (not teen/child) | caption |

## Score

```
score =  csoportos              ? 100 : 0
      + (csoportos && oktatos)  ?  50 : 0
      +  felnott                ?  20 : 0
```

Sort by `score` descending; ties broken by engagement (`likes + comments`). Top 5 are kept.

## Rationale (from the user's preferences)

- **Group activities first**, and within groups **teacher-led first** → the two largest weights.
- **Adults before minors**.

## What changed on 2026-08-07

Two parameters were removed with the vision call ([decisions](/project/decisions.md#deepseek)):

| Removed | Was worth | Why it is gone |
|---|---|---|
| `kepTipus` (`csoport`/`egy`/`tevekenyseg`/`nincs`) | +8 / +4 / 0 | Derivable only from the image. |
| `ratirtSzoveg` (text burned onto the image) | −10 | Derivable only from the image. |

`felnott` used to be judged from image **and** text; it is now caption-only. The prompt instructs the
model to answer **`true` when uncertain**, and captions rarely state age — so in practice `felnott` is
`true` for nearly every pick, which makes its `+20` close to a constant offset that **does not
differentiate**. Effectively the ordering now rests on two bits: `csoportos` and `csoportos && oktatos`.

**Accepted consequence:** the score takes five nominal values (0, 20, 100, 120, 170) but realistically
two or three, so ties are frequent and **engagement decides the order much more often than before**.
The user chose this over inventing replacement caption heuristics (2026-08-07). If the ordering turns
out too flat in practice, two fallbacks are available, in order of effort: change the `felnott` prompt
rule to "false when uncertain" (one line, restores a real third bit), or add a caption-quality signal
(bait penalty / descriptive-caption bonus).

The 2026-07-04 validation example (a Hajj group photo ranking #1, a solo Waymo ride with a text overlay
ranking last) no longer applies as written: the overlay penalty that pushed the Waymo item to the back
does not exist anymore. The group-first outcome still holds.
