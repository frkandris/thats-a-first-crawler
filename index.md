# Index

Catalog of this wiki, by category. One line per concept. See [CLAUDE.md](/CLAUDE.md) for conventions
and [log.md](/log.md) for history.

## Project — That's a First Digest
- [thats-a-first-digest](/project/thats-a-first-digest.md) — the daily IG/TikTok "first time" digest, end to end.
- [website](/project/website.md) — the Next.js web MVP in /web: public collection, outreach admin, newsletter builder, PDF.
- [pipeline](/project/pipeline.md) — the n8n node chain and data flow.
- [ranking-algorithm](/project/ranking-algorithm.md) — deterministic caption-based scoring & sort.
- [email-format](/project/email-format.md) — the exact per-item digest layout and the hashtag delta block.
- [build-request-node](/project/build-request-node.md) — normalization, dedup, hashtag deltas, model request.
- [parse-response-node](/project/parse-response-node.md) — validate, score, sort, render HTML.
- [dedup-datatable](/project/dedup-datatable.md) — the sent-URL dedup store.
- [hashtag-counts-datatable](/project/hashtag-counts-datatable.md) — daily hashtag totals behind the delta block.
- [credentials](/project/credentials.md) — Apify / router / DeepSeek / Gmail credentials.
- [runbook](/project/runbook.md) — operate, test, and troubleshoot.
- [decisions](/project/decisions.md) — why the system is built the way it is.

## Tech — reusable knowledge
- [n8n](/tech/n8n.md) — the automation platform, Code nodes, Data Tables, publish/schedule.
- [apify](/tech/apify.md) — Instagram & TikTok scrapers, hashtag analytics, run-sync API, plan limits.
- [meetapedia-router](/tech/meetapedia-router.md) — the free-tier LLM gateway the digest calls; `auto` routing, quotas, errors.
- [deepseek-api](/tech/deepseek-api.md) — *superseded* paid chat API, kept as the documented fallback; JSON mode and pricing.
- [wsrv-image-proxy](/tech/wsrv-image-proxy.md) — wsrv.nl proxy that makes CDN images render in email.
- [nextjs](/tech/nextjs.md) — Next.js 16 App Router, `proxy.ts`, rewrites, async params.
- [node-sqlite](/tech/node-sqlite.md) — Node's built-in SQLite, the website's zero-dependency storage.
- [newsletter-delivery](/tech/newsletter-delivery.md) — Substack has no API; the publisher-adapter layer.
- [pdfkit](/tech/pdfkit.md) — the lead-magnet PDF and the Hungarian-accent font trap.

## Format — meta
- [okf](/format/okf.md) — Open Knowledge Format v0.1 specification.
- [llm-wiki-pattern](/format/llm-wiki-pattern.md) — Karpathy's LLM-maintained wiki pattern and its page discipline.
