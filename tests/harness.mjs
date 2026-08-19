// Runs a real node source file from nodes/ inside a fake n8n runtime.
//
// The point is that these tests execute the SAME text that runs in production
// (mirrored by scripts/sync_nodes.py), not a copy of the logic. A test against a
// re-typed copy proves only that the copy works.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/**
 * @param slug        file in nodes/, without .js
 * @param opts.nodes  { 'Node name': [ {..json..}, ... ] } — what $('Node name') returns.
 *                    A name that is absent throws, exactly as n8n does for a node
 *                    that has not executed yet. That behaviour is load-bearing:
 *                    see the dedup incident in project/dedup-datatable.md.
 * @param opts.input  items arriving on the node's own input ($input)
 */
export function runNode(slug, { nodes = {}, input = [] } = {}) {
  const src = fs.readFileSync(path.join(ROOT, 'nodes', slug + '.js'), 'utf8');
  const wrap = (rows) => {
    const items = rows.map((json) => ({ json }));
    return { all: () => items, first: () => items[0], last: () => items[items.length - 1] };
  };
  const $ = (name) => {
    if (!Object.prototype.hasOwnProperty.call(nodes, name)) {
      throw new Error(`Referenced node doesn't exist: ${name}`);
    }
    return wrap(nodes[name]);
  };
  const $input = wrap(input);
  const fn = new Function('$', '$input', 'DateTime', src);
  return fn($, $input, undefined);
}

/** Convenience: the single json payload a Code node returns. */
export function runNodeJson(slug, opts) {
  const out = runNode(slug, opts);
  return out[0].json;
}

/** An ISO date N days before today, for lookback-window fixtures. */
export const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
