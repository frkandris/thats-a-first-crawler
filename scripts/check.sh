#!/usr/bin/env bash
# The commit build: one command, everything, fails on the first red stage.
#   bash scripts/check.sh          tests + wiki lint  (no network, no secrets)
#   bash scripts/check.sh --live   also checks nodes/ against the live workflow
#
# Fowler's rule applies: any failure fails the build. 99.9% green is still red.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ "${1:-}" == "--live" ]]; then
  echo "==> node drift (repo vs live n8n workflow)"
  python3 scripts/sync_nodes.py --check
fi

echo "==> node syntax"
for f in nodes/*.js; do
  # n8n wraps Code nodes in an async function, so top-level await is legal there
  # but not for a bare `node --check`. Wrap before checking.
  tmp="$(mktemp -t nodecheck).mjs"
  { echo '(async () => {'; cat "$f"; echo '})();'; } > "$tmp"
  node --check "$tmp" || { echo "  SYNTAX FAIL: $f"; exit 1; }
  rm -f "$tmp"
  echo "  ok  $f"
done

echo "==> tests"
node --test tests/*.test.mjs

echo "==> wiki lint"
python3 scripts/lint_wiki.py

echo
echo "all green"
