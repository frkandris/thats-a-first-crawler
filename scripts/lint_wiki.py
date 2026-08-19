#!/usr/bin/env python3
"""Wiki health checks from CLAUDE.md's "Lint" operation, as code rather than habit.

Checks, all of them things that actually broke here at least once:
  1. every non-reserved page has non-empty frontmatter `type`   (OKF conformance)
  2. no broken bundle-relative links                            (rot)
  3. no orphans — every page is linked from somewhere            (discoverability)
  4. the README concept-page badge matches reality               (drifted twice)
  5. pages edited in the last commit carry that day's timestamp  (stale timestamps)
  6. no page contradicts the ground-truth model/token invariants (drift)

Exit code 1 on any failure. Run: python3 scripts/lint_wiki.py
"""
import glob, io, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESERVED = {"index.md", "log.md"}
META = {"README.md", "CLAUDE.md"}
# Illustrations inside the OKF spec, flagged as such in format/okf.md itself.
SPEC_EXAMPLES = {"/contributing.md", "/path/to/concept.md", "/tables/customers.md", "/tables/orders.md"}
LINK = re.compile(r"\]\((/[^)#\s]*\.md)")

# The node source in nodes/ is the ground truth (mirrored from the live workflow
# by scripts/sync_nodes.py). CLAUDE.md's "Ground-truth invariants" section must
# agree with it. Prose elsewhere is deliberately NOT regex-checked: pages quote
# old values legitimately ("8000 was a flat 413"), and a linter that cries wolf
# on history gets ignored — which is worse than not having one.
CODE_INVARIANTS = [
    ("build-request.js", r"model:\s*'([^']+)'",            "model"),
    ("build-request.js", r"max_tokens:\s*(\d+)",            "max_tokens"),
    ("build-request.js", r"reasoning_effort:\s*'([^']+)'",  "reasoning_effort"),
]


def pages():
    out = {}
    for p in sorted(glob.glob("**/*.md", recursive=True)):
        if p.startswith(("web/", "node_modules/", ".venv/")):
            continue
        out[p] = io.open(p, encoding="utf-8").read()
    return out


def main():
    os.chdir(ROOT)
    P = pages()
    fails = []
    refs = set()
    for s in P.values():
        refs |= set(LINK.findall(s))

    concepts = [p for p in P if os.path.basename(p) not in RESERVED and p not in META]

    for p, s in P.items():
        for link in LINK.findall(s):
            if link not in SPEC_EXAMPLES and not os.path.isfile("." + link):
                fails.append(f"broken link: {p} -> {link}")
        if p in concepts:
            m = re.match(r"^---\n(.*?)\n---\n", s, re.S)
            if not m or not re.search(r"^type:\s*\S", m.group(1), re.M):
                fails.append(f"missing frontmatter type: {p}")
            if "/" + p not in refs:
                fails.append(f"orphan (linked from nowhere): {p}")

    badge = re.search(r"docs-(\d+)%20concept", P.get("README.md", ""))
    if badge and int(badge.group(1)) != len(concepts):
        fails.append(f"README badge says {badge.group(1)} concept pages, found {len(concepts)}")

    # Pages touched by the last commit should carry that commit's date.
    try:
        day = subprocess.check_output(["git", "log", "-1", "--format=%cs"], text=True).strip()
        touched = subprocess.check_output(["git", "show", "--name-only", "--format=", "HEAD"],
                                          text=True).split()
        for p in touched:
            if p in P and p in concepts:
                ts = re.search(r"^timestamp:\s*(\S{10})", P[p], re.M)
                if ts and ts.group(1) != day:
                    fails.append(f"stale timestamp: {p} says {ts.group(1)}, last edited {day}")
    except subprocess.CalledProcessError:
        pass

    claude = P.get("CLAUDE.md", "")
    for filename, pattern, label in CODE_INVARIANTS:
        path = os.path.join("nodes", filename)
        if not os.path.isfile(path):
            fails.append(f"missing {path} — run scripts/sync_nodes.py")
            continue
        m = re.search(pattern, io.open(path, encoding="utf-8").read())
        if not m:
            fails.append(f"could not find {label} in {path}")
            continue
        value = m.group(1)
        if value not in claude:
            fails.append(f"CLAUDE.md does not mention the live {label} {value!r} "
                         f"(from {path}) — invariants must track the code")

    for f in fails:
        print("FAIL " + f)
    print(f"\n{len(concepts)} concept pages, {len(refs)} internal links, {len(fails)} problem(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
