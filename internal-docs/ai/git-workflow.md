# Git Workflow Rules

These rules apply to every AI agent working in this repo. No exceptions unless the
user gives explicit, per-command approval.

## Forbidden operations

| Operation | Why |
|-----------|-----|
| `git push --force` / `--force-with-lease` | Rewrites remote history. Never do this, even on feature branches. |
| `git rebase` (interactive or non-interactive) | Rewrites commit history. Use merge commits instead. |
| Squash merging | Each commit is a meaningful unit of work. Preserve the full commit chain. |
| `git reset --hard` | Destroys local work irreversibly. |
| `git reset --soft` / `--mixed` to rewrite already-pushed commits | If the commit is already on the remote, do not rewrite it. Create a new commit instead. |
| `git commit --amend` on already-pushed commits | Same as above — creates divergence that requires a force push. |
| `git push` to `main` directly | Always go through a PR. |
| Editing `.git/config` or git identity settings | Never touch git configuration. |

## Safe operations

- `git commit --amend` is allowed **only** when the commit has **not** been pushed
  to the remote yet (e.g. fixing a typo right after committing locally, before push).
- `git reset --soft HEAD~1` is allowed **only** when the commit has **not** been
  pushed to the remote yet.
- `git pull --ff-only` is the preferred way to update from remote.
- `git merge` (regular, non-squash) is fine for integrating branches.

## Workflow

1. Always branch from `main` (or the base branch specified by the user/issue).
2. Make focused commits — one logical change per commit.
3. Push with `git push` (or `git push -u origin HEAD` for new branches). Never add
   `--force` flags.
4. If you need to fix something after pushing, create a **new commit** with the fix.
   Do not amend or rebase.
5. Open a PR for review. Never push directly to `main`, and never merge your own PR
   unless the user explicitly asks.

## Commit messages

Write a concise subject line describing the change, then a blank line, then one or
more `- ` bullets naming the concrete changes in that commit (not the whole feature
scope). Keep bullets to what that specific commit actually changes.

```text
Centralize all product lists

- applies shared css to list containers
- adds a List component using ul/li
```

If the work is tied to a tracked issue, you may reference its number in the subject
(e.g. `Centralize all product lists (#322)`) — but the subject should still read as
a human-legible description on its own. No issue reference is required for
housekeeping, docs-only, or merge commits.

Pass multi-line messages with a HEREDOC so newlines are preserved:

```bash
git commit -m "$(cat <<'EOF'
Centralize all product lists

- applies shared css to list containers
- adds a List component using ul/li
EOF
)"
```

## When in doubt

If a git operation feels destructive or history-rewriting, **do not run it**. Ask
the user instead.
