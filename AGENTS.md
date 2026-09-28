# Working in this repository

Comments: DRY, concise, HEAD-only, non-local only. No paraphrase, no TODOs, no changelog. Favor regression rationale in tests. Delete rot.

Docs: md + wikilinks, DRY. Live: modify, kill, archive at will. Argue the alternatives code cannot. Links resolve. Shape follows content. A dated doc is a decision record with a status; when it is built, its contract moves to the reference or guide and the record is archived. A component's docs/index.md is where its documents start; where a doc and the code disagree, the code is right and the doc is the bug.

Errors: do not swallow errors, only try/catch what you can resolve, fail loudly, no fallback paths, die instead of logging.

Dependencies: cross clear domain boundaries only; pin internal and external deps. Prefer reproducible, portable, relocatable choices.
