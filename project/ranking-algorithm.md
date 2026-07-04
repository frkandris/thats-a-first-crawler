---
type: Algorithm
title: Ranking algorithm
description: Deterministic scoring and sort that orders the daily picks from Claude-extracted, vision-derived parameters.
resource: https://n8n.strt.hu/workflow/JEHhYDEEklYRoIHb
tags: [ranking, scoring, vision]
timestamp: 2026-07-04T00:00:00Z
---

Ranking is **deterministic and done in code** ([parse-claude-node](/project/parse-claude-node.md)), not
left to the model's judgement. [Claude vision](/tech/claude-vision-api.md) only *extracts parameters*
per candidate (from the caption **and** the image); the score and order are computed from them.

## Parameters (per pick)

| Field | Meaning | Source |
|---|---|---|
| `csoportos` | done together / as a group | text + image |
| `oktatos` | learned from a coach/teacher/host/guide | text + image |
| `felnott` | the person is an adult (not teen/child) | image + text |
| `kepTipus` | `csoport` (group photo) / `egy` (one person) / `tevekenyseg` (activity only) / `nincs` | image |
| `ratirtSzoveg` | text/caption burned onto the image (overlay) | image |

## Score

```
score =  csoportos            ? 100 : 0
      + (csoportos && oktatos) ?  50 : 0
      +  felnott               ?  20 : 0
      +  kepTipus == 'csoport' ?   8 : kepTipus == 'egy' ? 4 : 0
      - (ratirtSzoveg          ?  10 : 0)
```

Sort by `score` descending; ties broken by engagement (`likes + comments`). Top 5 are kept.

## Rationale (from the user's preferences)

- **Group activities first**, and within groups **teacher-led first** → the two largest weights.
- **Adults before minors**.
- Image type: **group photo > single person > activity-only**.
- **Text-overlay images pushed to the back** (they read as engagement-bait / lower quality).

Validated on 2026-07-04: a Hajj group photo (csoportos + group photo) ranked #1; a Waymo ride that
was solo, single-person, **and** had a "Trying a driverless car" overlay ranked last. See
[decisions](/project/decisions.md).
