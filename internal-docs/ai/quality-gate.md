# Quality gate

The repository uses Oxlint and Oxfmt through package scripts. Always invoke npm
through Meteor so the repository uses Meteor's bundled Node version.

## Check without modifying files

```bash
meteor npm run quave-check-ci
```

This is the preferred final gate and the command CI should run.

## Apply safe automatic fixes

```bash
meteor npm run quave-check
```

This runs the repository's fixing lint and formatting scripts. Review the diff
afterward because automatic fixes can touch files outside the immediate edit.

## Handling findings

- Fix errors caused by the current change.
- Do not hide a finding with a blanket disable or by weakening repository-wide
  configuration.
- Use the narrowest inline suppression only when the code is intentionally valid,
  the rule cannot express that case, and a short comment explains why.
- If a pre-existing finding blocks the gate, separate it from the requested work
  when possible and report it precisely rather than claiming the gate passed.
