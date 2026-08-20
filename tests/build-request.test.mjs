import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runNodeJson, daysAgo } from './harness.mjs';

const CONFIG = { recipient: 'x@example.com', lookbackDays: 30 };

const igPost = (over = {}) => ({
  url: 'https://www.instagram.com/p/AAA111/', caption: 'Ma volt az első fazekas órám',
  likesCount: 100, commentsCount: 5, timestamp: daysAgo(1), displayUrl: 'https://cdn/img.jpg',
  locationName: 'Budapest', hashtags: ['thatsafirst'], ...over });

const base = (over = {}) => ({
  'Config': [CONFIG], 'Apify - Instagram': [igPost()], 'Apify - TikTok': [],
  'Get sent': [], ...over });

test('assembles a Groq request with the pinned model and budget', () => {
  const out = runNodeJson('build-request', { nodes: base() });
  assert.equal(out.body.model, 'openai/gpt-oss-120b');
  assert.equal(out.body.max_tokens, 3000);   // see the TPM test below for why
  assert.equal(out.body.reasoning_effort, 'low');
  assert.equal(out.body.stream, false);
  assert.deepEqual(out.body.response_format, { type: 'json_object' });
  assert.equal(out.body.messages.length, 2);
  assert.match(out.body.messages[0].content, /json/i, 'system prompt must contain "json"');
});

test('the system prompt keeps the literal shape example', () => {
  const { body } = runNodeJson('build-request', { nodes: base() });
  assert.match(body.messages[0].content, /"picks"\s*:\s*\[\s*\{/,
    'the shape example is the only schema the model gets');
  for (const field of ['index', 'line', 'csoportos', 'oktatos', 'felnott']) {
    assert.match(body.messages[0].content, new RegExp(`"${field}"`), `example must show ${field}`);
  }
});

test('the request stays inside Groq\'s 8000 token-per-minute window', () => {
  // Groq bills prompt + max_tokens against one window BEFORE generating, so an
  // oversized ceiling is a 413, not a truncated answer. See tech/groq.md#tpm.
  const cands = Array.from({ length: 40 }, (_, i) =>
    igPost({ url: `https://www.instagram.com/p/P${i}/`, caption: 'először ' + 'x'.repeat(300) }));
  const { body } = runNodeJson('build-request', { nodes: base({ 'Apify - Instagram': cands }) });
  const chars = body.messages.reduce((n, m) => n + m.content.length, 0);
  const estTokens = Math.ceil(chars / 3.2);          // Hungarian ≈ 3.2 chars/token
  assert.ok(estTokens + body.max_tokens <= 8000,
    `prompt ~${estTokens} + max_tokens ${body.max_tokens} exceeds the 8000 TPM window`);
});

test('dedup matches URLs that differ only in form', () => {
  const sent = [{ url: 'https://instagram.com/reel/AAA111?igshid=xyz' }];
  const out = runNodeJson('build-request', { nodes: base({ 'Get sent': sent }) });
  assert.equal(out.candidateCount, 0, 'reel/ vs /p/, query string and www must canonicalize equal');
});

test('within-run duplicates are dropped', () => {
  const twice = [igPost(), igPost({ likesCount: 999 })];
  const out = runNodeJson('build-request', { nodes: base({ 'Apify - Instagram': twice }) });
  assert.equal(out.candidateCount, 1);
});

test('a missing Get sent throws instead of passing everything through', () => {
  // The 2026-08-10 incident: a swallowing try/catch turned an unwired reader
  // into "nothing sent yet", and every candidate passed the filter for weeks.
  const nodes = base();
  delete nodes['Get sent'];
  assert.throws(() => runNodeJson('build-request', { nodes }), /Get sent has not executed/);
});

test('posts older than lookbackDays are dropped', () => {
  const old = igPost({ url: 'https://www.instagram.com/p/OLD/', timestamp: daysAgo(45) });
  const out = runNodeJson('build-request', { nodes: base({ 'Apify - Instagram': [igPost(), old] }) });
  assert.equal(out.candidateCount, 1);
});

test('at most 30 candidates reach the model, first-time signals first', () => {
  const many = Array.from({ length: 50 }, (_, i) =>
    igPost({ url: `https://www.instagram.com/p/N${i}/`, caption: 'random napi vlog', likesCount: i }));
  const signal = igPost({ url: 'https://www.instagram.com/p/FIRST/',
                          caption: 'életemben először próbáltam ki', likesCount: 0 });
  const out = runNodeJson('build-request', { nodes: base({ 'Apify - Instagram': [...many, signal] }) });
  assert.equal(out.candidateCount, 30);
  assert.equal(out.cands[0].url, 'https://www.instagram.com/p/FIRST/',
    'a zero-engagement first-time post must outrank high-engagement noise');
});

test('images are proxied for email and never sent to the model', () => {
  const out = runNodeJson('build-request', { nodes: base() });
  assert.match(out.cands[0].image, /^https:\/\/wsrv\.nl\/\?url=/);
  const asText = JSON.stringify(out.body);
  assert.ok(!asText.includes('wsrv.nl'), 'the request body must not carry image URLs');
  assert.ok(!asText.includes('image'), 'the request body must stay text-only');
});

test('the dedup read count is surfaced as a diagnostic', () => {
  // A zero here with a non-empty table is the signature of the 2026-08-10
  // incident, so it must stay visible in the run data.
  const out = runNodeJson('build-request', {
    nodes: base({ 'Get sent': [{ url: 'https://x/p/Q/' }] }) });
  assert.equal(out.sentRowCount, 1);
});
