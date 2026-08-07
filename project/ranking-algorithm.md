---
type: Algorithm
title: Ranking algorithm
description: Deterministic scoring and sort that orders the daily picks from caption-derived parameters extracted by the model.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [ranking, scoring]
timestamp: 2026-08-07T00:00:00Z
---

Ranking is **deterministic and done in code** ([parse-response-node](/project/parse-response-node.md)), not
left to the model's judgement. [DeepSeek](/tech/deepseek-api.md) only *extracts parameters* per candidate
(from the caption); the score and order are computed from them.

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

`felnott` used to be judged from image **and** text; it is now caption-only and therefore less reliable —
expect it to be `false` more often, since many captions simply do not say.

**Accepted consequence:** the score now takes only four distinct values (0, 20, 100, 120, 170), so ties
are common and **engagement decides the order much more often than before**. The user chose this over
inventing replacement caption heuristics (2026-08-07). If the ordering turns out too flat in practice,
the fallback discussed was a caption-quality signal (bait penalty / descriptive-caption bonus).

The 2026-07-04 validation example (a Hajj group photo ranking #1, a solo Waymo ride with a text overlay
ranking last) no longer applies as written: the overlay penalty that pushed the Waymo item to the back
does not exist anymore. The group-first outcome still holds.
