---
type: Reference
title: Credentials
description: The three credentials the workflow needs and how they are configured in n8n.
resource: https://n8n.strt.hu/workflow/JEHhYDEEklYRoIHb
tags: [credentials, security, auth]
timestamp: 2026-07-04T00:00:00Z
---

Three credentials, all created by the human in [n8n](/tech/n8n.md). **Secrets are never typed by the
assistant** — the human pastes the token/key value into the field; the assistant fills everything else.

| Credential | Kind | Detail |
|---|---|---|
| **Apify header** | HTTP Header Auth | header `Authorization: Bearer <APIFY_TOKEN>` — used by both [Apify](/tech/apify.md) HTTP nodes |
| **Anthropic** | HTTP Header Auth | header `x-api-key: <ANTHROPIC_KEY>` (plus static `anthropic-version: 2023-06-01`) — used by the Claude node |
| **Gmail account - andris@strt.hu** | Gmail OAuth2 | existing OAuth credential; sends as `andris@strt.hu` |

## Security notes

- API keys and account passwords are never printed or entered by the assistant; the user pastes them.
- The Apify plan is **paid** (subscribed 2026-07-04); the free plan could not launch the TikTok actor.
- See [runbook](/project/runbook.md) for auth-related failure modes.
