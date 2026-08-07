---
type: Reference
title: Credentials
description: The three credentials the workflow needs and how they are configured in n8n.
resource: https://<n8n-host>/workflow/<workflow-id>
tags: [credentials, security, auth]
timestamp: 2026-08-07T00:00:00Z
---

Three credentials, all created by the human in [n8n](/tech/n8n.md). **Secrets are never typed by the
assistant** — the human pastes the token/key value into the field; the assistant fills everything else.

| Credential | Kind | Detail |
|---|---|---|
| **Apify header** | HTTP Header Auth | header `Authorization: Bearer <APIFY_TOKEN>` — used by all three [Apify](/tech/apify.md) HTTP nodes |
| **DeepSeek** | HTTP Header Auth | header `Authorization: Bearer <DEEPSEEK_API_KEY>` — used by the [DeepSeek](/tech/deepseek-api.md) node |
| **Gmail account** | Gmail OAuth2 | existing OAuth credential for the sending mailbox |

The **Anthropic** credential (`x-api-key` + `anthropic-version`) was retired on 2026-08-07 with the model
switch; delete it in n8n once the DeepSeek node is verified green.

## Security notes

- API keys and account passwords are never printed or entered by the assistant; the user pastes them.
- A DeepSeek key was pasted into a chat on **2026-08-07** and must be treated as compromised: rotate it in
  the DeepSeek console and paste only the new value into n8n. Keys shared in a chat transcript are not
  secret, even if the message is deleted.
- The Apify plan is **paid** (subscribed 2026-07-04); the free plan could not launch the TikTok actor.
- See [runbook](/project/runbook.md) for auth-related failure modes.
