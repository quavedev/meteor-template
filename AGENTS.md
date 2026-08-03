# AI Instructions

This file is the source of truth for AI tools working in this repository. Keep it
short and high-signal. Longer explanations and examples live in
[`internal-docs/ai/`](internal-docs/ai/).

## Project

This repository is a production-oriented template for Meteor 3.5 applications
using React 19, React Compiler, Tailwind CSS 4, MongoDB, and Rspack. Applications
created from it should replace this section with their own product context,
constraints, and external-system boundaries.

## Commands

Always use Meteor's bundled Node and npm inside this repository. Bare `npm` can
produce a lockfile for the wrong Node version.

```bash
meteor npm install
meteor npm start
meteor npm run quave-check
meteor npm run quave-check-ci
```

## Core rules

Read [`internal-docs/ai/coding-style.md`](internal-docs/ai/coding-style.md) and
[`internal-docs/ai/meteor3-compat.md`](internal-docs/ai/meteor3-compat.md) before
changing application code.

1. Use JavaScript, ESM, named functions, and named-parameter objects. Keep code
   organized by feature or domain.
2. Meteor 3 server code is async. Await server database reads and writes and use
   async Meteor APIs such as `Meteor.userAsync()`.
3. **Never share Mongo/Minimongo data-access code between client and server.** Server-only
   publications read Mongo and publish data. Client-only code subscribes, then reads the
   resulting Minimongo data with `find`/`findOne`. Persistent mutations go through
   validated, authorized server-only methods. Shared modules may contain pure utilities,
   schemas, constants, enums, and collection definitions, but never queries, writes,
   publications, subscriptions, or method implementations. Do not use `Meteor.isClient`
   / `Meteor.isServer` branches to make one data-access function run in both environments,
   and do not depend on client method simulation for correctness.
4. Create collections with `createCollection()` from
   `meteor/quave:collections`. Prefer the collection helpers and async write APIs
   already established by this repository.
5. Validate method arguments and collection documents. Authorize every read and
   write against the acting user and the resource being accessed. Do not assume
   every collection is user-owned or blindly add a `userId` filter.
6. Application source is ESM-only. Node-executed configuration files may use the
   module format required by their tool.
7. Do not add commented-out code, dead imports, credentials, tokens, personal
   data, or environment-specific secrets.

## Frontend

Read [`internal-docs/ai/frontend.md`](internal-docs/ai/frontend.md) before UI
work. Use Tailwind CSS 4's CSS-first configuration, preserve accessible semantics,
and validate every UI change at mobile and desktop widths. React Compiler is
enabled, so do not add manual memoization by default.

## Optional enum convention

If the generated application uses `@quave/enum`, follow
[`internal-docs/ai/enums.md`](internal-docs/ai/enums.md). Install it before adding
the first enum. Do not use the guide as evidence that the dependency is already
present.

## Git and safety

Follow [`internal-docs/ai/git-workflow.md`](internal-docs/ai/git-workflow.md).
Never commit secrets or local environment files. Avoid destructive or
history-rewriting Git operations unless the user explicitly requests and
authorizes the exact operation.

## Before finishing

1. Run `meteor npm run quave-check-ci` and the relevant tests. See
   [`internal-docs/ai/quality-gate.md`](internal-docs/ai/quality-gate.md).
2. If implementation work needs formatting fixes, run
   `meteor npm run quave-check`, review the resulting diff, then rerun the CI gate.
3. Update [`COLLECTIONS.md`](COLLECTIONS.md) when a collection or index changes.
4. Fix stale commands or guidance discovered during the task.
5. Review the complete diff for dead code, sensitive data, and unrelated changes.
