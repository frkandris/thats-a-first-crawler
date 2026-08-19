import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runNodeJson } from './harness.mjs';

const cand = (over = {}) => ({ url: 'https://www.instagram.com/p/AAA111/', platform: 'instagram',
  text: 'első fazekas óra', likes: 100, comments: 5, image: 'https://wsrv.nl/?url=x',
  location: 'Budapest', hashtags: 'thatsafirst', ...over });

const BUILD = { runDate: '2026-08-19', candidateCount: 3, hashtagStats: [],
                cands: [cand(), cand({ url: 'https://www.tiktok.com/@a/video/1', platform: 'tiktok' }),
                        cand({ url: 'https://www.instagram.com/p/CCC/' })] };

const reply = (content, finish = 'stop') =>
  ({ choices: [{ finish_reason: finish, message: { role: 'assistant', content } }] });

const run = (content, finish) =>
  runNodeJson('parse-response', { nodes: { 'Build request': [BUILD] }, input: [reply(content, finish)] });

const pick = (over = {}) => ({ index: 0, line: 'Fazekaskorong, Budapest - oktatóval - 100 like, 5 komment',
                               csoportos: true, oktatos: true, felnott: true, ...over });

test('parses a clean json_object answer', () => {
  const out = run(JSON.stringify({ picks: [pick()] }));
  assert.equal(out.picks.length, 1);
  assert.equal(out.picks[0].url, 'https://www.instagram.com/p/AAA111/');
  assert.match(out.html, /Fazekaskorong/);
});

test('survives a markdown-fenced answer', () => {
  // A provider without server-side JSON mode answers in a fence; jsonSlice cuts
  // to the outermost braces. See project/parse-response-node.md#jsonslice.
  const out = run('```json\n' + JSON.stringify({ picks: [pick()] }) + '\n```');
  assert.equal(out.picks.length, 1);
});

test('survives prose wrapped around the object', () => {
  const out = run('Itt a válasz:\n' + JSON.stringify({ picks: [pick()] }) + '\nRemélem jó.');
  assert.equal(out.picks.length, 1);
});

test('an unparseable answer is zero picks, never a throw', () => {
  const out = run('semmi json nincs itt');
  assert.equal(out.picks.length, 0);
  assert.ok(out.html !== undefined);
});

test('empty content with finish_reason length is flagged as truncated', () => {
  // A budget failure must be distinguishable from a genuinely empty selection,
  // otherwise a silent zero-pick morning looks like "nothing qualified today".
  const out = run('', 'length');
  assert.equal(out.picks.length, 0);
  assert.equal(out.truncated, true);
  assert.equal(out.finishReason, 'length');
});

test('an empty selection is a normal day, not truncation', () => {
  const out = run(JSON.stringify({ picks: [] }));
  assert.equal(out.picks.length, 0);
  assert.notEqual(out.truncated, true);
});

test('picks with an out-of-range or non-integer index are dropped', () => {
  const out = run(JSON.stringify({ picks: [pick({ index: 99 }), pick({ index: -1 }),
                                           pick({ index: 'kettő' }), pick({ index: 1 })] }));
  assert.equal(out.picks.length, 1);
});

test('picks without a line are dropped', () => {
  const out = run(JSON.stringify({ picks: [pick({ line: '   ' }), pick({ index: 1 })] }));
  assert.equal(out.picks.length, 1);
});

test('ranking is deterministic: csoportos+oktatos > csoportos > felnott only', () => {
  const out = run(JSON.stringify({ picks: [
    pick({ index: 0, line: 'egyedul felnott', csoportos: false, oktatos: false, felnott: true }),
    pick({ index: 1, line: 'csoportos oktato nelkul', csoportos: true, oktatos: false, felnott: false }),
    pick({ index: 2, line: 'csoportos oktatoval', csoportos: true, oktatos: true, felnott: false }),
  ] }));
  assert.deepEqual(out.picks.map(p => p.line),
    ['csoportos oktatoval', 'csoportos oktato nelkul', 'egyedul felnott']);
  assert.deepEqual(out.picks.map(p => p.score), [150, 100, 20]);
});

test('string booleans from the model are coerced', () => {
  const out = run(JSON.stringify({ picks: [pick({ csoportos: 'true', oktatos: 1, felnott: 'false' })] }));
  assert.equal(out.picks[0].csoportos, true);
  assert.equal(out.picks[0].oktatos, true);
  assert.equal(out.picks[0].felnott, false);
});

test('more than five picks are scored but trimmed to the top five', () => {
  const many = Array.from({ length: 8 }, (_, i) => pick({ index: i % 3, line: 'sor ' + i }));
  const out = run(JSON.stringify({ picks: many }));
  assert.ok(out.picks.length <= 5);
});

test('duplicate urls collapse to the highest-scoring pick', () => {
  const out = run(JSON.stringify({ picks: [
    pick({ index: 0, line: 'gyengebb', csoportos: false, oktatos: false, felnott: false }),
    pick({ index: 0, line: 'erosebb', csoportos: true, oktatos: true, felnott: true }),
  ] }));
  assert.equal(out.picks.length, 1);
  assert.equal(out.picks[0].line, 'erosebb');
});

test('the email carries the proxied image, not a raw CDN url', () => {
  const out = run(JSON.stringify({ picks: [pick()] }));
  assert.match(out.html, /wsrv\.nl/);
});
