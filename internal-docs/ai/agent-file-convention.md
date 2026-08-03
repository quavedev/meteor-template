# AI instruction file convention

## Canonical surfaces

| Purpose | File | Rule |
| --- | --- | --- |
| Repository instructions | [`AGENTS.md`](../../AGENTS.md) | Short, always-loaded source of truth for all AI tools. |
| Claude compatibility | [`CLAUDE.md`](../../CLAUDE.md) | Thin pointer to `AGENTS.md`; do not duplicate repository rules. |
| Detailed guidance | `internal-docs/ai/*.md` | Explanations, examples, and topic-specific rules linked from `AGENTS.md`. |
| Data inventory | [`COLLECTIONS.md`](../../COLLECTIONS.md) | Human-readable application-owned MongoDB schemas and indexes. |

## Maintenance rules

- Put a rule in `AGENTS.md` only when agents need it on most tasks.
- Put examples and deep explanations in the relevant topic document.
- Link to one canonical rule instead of copying it into tool-specific files.
- When implementation and documentation disagree, verify the intended behavior
  and update both in the same change.
- Replace template placeholders with product-specific context after generating a
  new application.
- Never add credentials, tokens, customer data, private URLs, production IDs, or
  environment-specific values to instruction files.
