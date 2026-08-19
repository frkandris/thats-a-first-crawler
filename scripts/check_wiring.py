#!/usr/bin/env python3
"""Assert the live workflow's wiring invariants. Needs the n8n API key.

These are graph properties, not code logic, so tests/ cannot see them — and both
of the incidents they encode were invisible in the UI:

  1. Every node referenced as $('X') must be an ANCESTOR of the referencing node.
     A parallel branch runs at the END of the run, so the reference reads empty.
     Cost: dedup silently disabled for weeks (project/dedup-datatable.md).
  2. The hashtag-counts branch must run BEFORE anything that can fail the run.
     n8n runs same-output targets in list order; with the model node first, four
     consecutive failed mornings never wrote the daily totals, and every delta
     went to 0 for 11 days.

Usage: python3 scripts/check_wiring.py
"""
import json, os, re, sys, urllib.request

CFG = os.path.expanduser("~/.n8n-claude.json")


def load():
    cfg = json.load(open(CFG))
    req = urllib.request.Request(cfg["host"] + "/api/v1/workflows/" + cfg["workflowId"],
                                 headers={"X-N8N-API-KEY": cfg["apiKey"]})
    return json.load(urllib.request.urlopen(req))


def ancestors(conns, target):
    """Every node that can reach `target` by following main connections."""
    parents = {}
    for src, spec in conns.items():
        for branch in spec.get("main", []):
            for c in branch or []:
                parents.setdefault(c["node"], set()).add(src)
    seen, stack = set(), list(parents.get(target, ()))
    while stack:
        n = stack.pop()
        if n in seen:
            continue
        seen.add(n)
        stack.extend(parents.get(n, ()))
    return seen


def main():
    wf = load()
    conns = wf["connections"]
    fails = []

    for node in wf["nodes"]:
        if node.get("disabled"):
            continue
        code = node.get("parameters", {}).get("jsCode", "")
        anc = ancestors(conns, node["name"])
        for ref in sorted(set(re.findall(r"\$\('([^']+)'\)", code))):
            if ref not in anc:
                fails.append(f"{node['name']} references $('{ref}') which is not an ancestor "
                             f"— it will read empty at runtime")

    targets = [c["node"] for c in conns.get("Build request", {}).get("main", [[]])[0] or []]
    if "Split counts" in targets and targets[0] != "Split counts":
        fails.append("Split counts must be FIRST in Build request's output list, so today's hashtag "
                     f"totals are written before a model failure can stop the run (now: {targets})")

    counts_anc = ancestors(conns, "Insert count row")
    if "Has picks?" in counts_anc:
        fails.append("the hashtag-counts branch is gated on Has picks? — totals must be written "
                     "on no-email days too, or the next delta breaks")

    for f in fails:
        print("FAIL " + f)
    print(f"\n{len(wf['nodes'])} nodes checked, {len(fails)} problem(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
