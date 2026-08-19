---
type: Reference
title: Credentials
description: The credentials the workflow needs and how they are configured in n8n.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [credentials, security, auth]
timestamp: 2026-08-19T00:00:00Z
---

Four credentials in [n8n](/tech/n8n.md). **Secrets are never typed by the assistant** — the human pastes
the token/key value into the field; the assistant fills everything else.

| Credential | Kind | Detail |
|---|---|---|
| **Apify header** | HTTP Header Auth | header `Authorization: Bearer <APIFY_TOKEN>` — used by all three [Apify](/tech/apify.md) HTTP nodes |
| **Groq header** | HTTP Header Auth | header `Authorization: Bearer <GROQ_API_KEY>` — used by the **AI - Groq** node ([groq](/tech/groq.md)). Our own free-tier key, not shared with any other system |
| **Meetapedia router header** | HTTP Header Auth | header `Authorization: Bearer <ROUTER_API_KEY>` — unused since 2026-08-19; kept because the [gateway](/tech/meetapedia-router.md) still works for jobs that can tolerate scheduling |
| **DeepSeek header** | HTTP Header Auth | header `Authorization: Bearer <DEEPSEEK_API_KEY>` — used by the disabled [DeepSeek](/tech/deepseek-api.md) standby node; kept for rollback |
| **Gmail account** | Gmail OAuth2 | existing OAuth credential for the sending mailbox |

`ROUTER_API_KEY` is **not a vendor key**: the gateway reads a comma-separated allowlist from its own
`ROUTER_API_KEY` env var, so the digest got its own entry and can be revoked alone without touching the
other consumers. Unset on the gateway side = every request 401s; there is no open mode.

**Why the digest has its own vendor key at all.** Sharing a quota pool with the Meetapedia crawler failed
in practice, not in theory: see [decisions](/project/decisions.md#own-groq-key). A key that only this
workflow uses cannot be starved by another system, and cannot starve one either.

The **Anthropic** credential (`x-api-key` + `anthropic-version`) was retired with the 2026-08-07 model
switch and is gone from the instance — `GET /api/v1/credentials` no longer lists it (checked 2026-08-18).

## Security notes

- API keys and account passwords are never printed or entered by the assistant; the user pastes them.
- A DeepSeek key was pasted into a chat on **2026-08-07**, and the **Groq key on 2026-08-19**. Both must
  be treated as compromised: rotate them in the vendor console and paste only the new value into n8n.
  Keys shared in a chat transcript are not secret, even if the message is deleted. Rotating the Groq key
  is a one-field edit on the `Groq header` credential — nothing else references it.
- The Apify plan is **paid** (subscribed 2026-07-04); the free plan could not launch the TikTok actor.
- See [runbook](/project/runbook.md) for auth-related failure modes.
