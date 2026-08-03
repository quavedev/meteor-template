# Coding style

House conventions for applications generated from this template. The stack is **Meteor
3.5**, React 19 with React Compiler, Tailwind CSS 4, MongoDB, and Rspack. Follow these
rules for every application-code change unless the generated project deliberately
documents a replacement convention.

All npm commands use the Meteor-bundled toolchain: run **`meteor npm ...`**, never bare
`npm`. Meteor ships its own Node/npm; bare `npm` uses the system version and corrupts the
lockfile.

---

## 1. Language & functional style

- **JavaScript only — never TypeScript.**
- **Functional style.** Prefer pure functions and immutable data; avoid mutations.
- **Named functions.** Avoid anonymous functions where a name adds meaning.
- **Named parameters.** Functions take a single object argument with named properties,
  not positional args.
- Use modern ES features (destructuring, spread, optional chaining, `async/await`).

```javascript
// ✅ Named function, single named-parameter object
const buildLabel = ({ product, quantity }) => `${product} × ${quantity}`;
buildLabel({ product: aspirin, quantity: 2 });

// ❌ Positional args
const buildLabel = (product, quantity) => `${product} × ${quantity}`;
```

### Never use loose enum strings

When a field has a fixed set of values, model it as an enum and always reference the
value through its `.name` (or `.value`) property. Never hardcode the equivalent string
literal — loose strings bypass refactors, hide broken references, and defeat grep audits.

```javascript
if (order.status === OrderStatus.DISPATCHED.name) { /* ... */ }  // ✅
if (order.status === 'DISPATCHED') { /* ... */ }                 // ❌ loose string
```

---

## 2. Code organization

- **Feature / domain folders.** Source lives in domain folders under `app/` (e.g.
  `app/users`, `app/components`, `app/layouts`, `app/infra`, `app/general`), plus the
  root `client/` and `server/` entry folders. Group by feature, not by technical layer.
- **One thing per file.** A file exports a single collection, component, or cohesive set
  of related functions. Name the file after what it exports.
- **Consistent naming.** Follow the existing `{entity}{Type}.js` pattern already in the
  repo, e.g. `UsersCollection.js`, `serverStatusMethods.js`, `Status.js`.
  - `*Collection.js` — a collection definition.
  - `*Methods.js` — Meteor methods (auth + validation, then call the logic).
  - Keep pure business logic in its own function/file so methods stay thin.
- **Relative imports** between our own modules: `from '../users/UsersCollection'`. Do not
  add a `.js` extension to our own module specifiers (`'./health'`, not `'./health.js'`);
  third-party packages keep whatever path they publish.

---

## 3. No isomorphic data access — keep client and server separate

**Never write one data-access function or module that runs against Mongo on the server
and Minimongo on the client.** The similar collection APIs are not permission to share
query or mutation logic across environments. Do not hide the distinction behind
`Meteor.isClient`, `Meteor.isServer`, environment checks, or a wrapper that selects sync
versus async collection calls.

- **Server-only publications** authorize and read Mongo, then publish the permitted data.
- **Client-only UI/hooks** subscribe to those publications, then read the resulting local
  Minimongo data synchronously with `find`, `findOne`, or `fetch`.
- **Server-only methods** validate and authorize every persistent mutation, then read or
  write Mongo with awaited async APIs. The client only calls those methods.
- **Client code never writes to Minimongo directly** and has no client-side simulation
  stubs that mutate data.
- Shared modules may contain **pure utilities**, constants, schemas, enums, pure domain
  calculations, and the declarative collection definition required by both
  bundles. They must not contain collection queries or writes, publication/subscription
  logic, method implementations, or any other Mongo/Minimongo access.

This means sharing a pure function such as `calculateTotal({ items })` is correct. Sharing
`findOrders({ userId })`, where the same function queries Mongo or Minimongo depending on
the runtime, is forbidden.

---

## 4. ESM-only, static imports

App source is **ESM only**. Never use CommonJS in app modules:

```javascript
// ✅ named ESM exports / imports
export { buildLabel, formatPrice };
import { buildLabel } from '../general/labels';

// ❌ never in app source
module.exports = { buildLabel };
const { buildLabel } = require('../general/labels');
```

Node/tool config entrypoints that Node runs directly (e.g. `rspack.config.js` and
`postcss.config.mjs`) are the only place non-app module formats
belong; do not bring their patterns into app source.

**Imports are static by default.** Use top-level `import` for ordinary dependencies.
Reserve dynamic `await import(...)` for genuine lazy boundaries — breaking a circular
dependency, or loading a server-only/heavy module only on the path that needs it. When
you must, the caller is `async`, the import is awaited, and a small top-level `loadX()`
helper is preferred over scattered raw `import()` calls. Never use `require()` as a lazy
import, and never hide an ordinary dependency behind a nested import.

```javascript
// ✅ static, top-level
import { UsersCollection } from '../users/UsersCollection';

// ✅ dynamic only for a real lazy/cycle boundary, awaited from async code
const loadMailer = () => import('../infra/mailer');
export const notifyUser = async ({ userId }) => {
  const { sendEmail } = await loadMailer();
  await sendEmail({ userId });
};
```

---

## 5. Meteor 3 server is async-only

On the **server**, the old synchronous Mongo/Meteor APIs do not exist. Use the `*Async`
counterparts with `await`, and declare every method `async`.

- Banned on the server: `findOne`, `insert`, `update`, `remove`, `fetch`, `count`,
  `forEach`, `map` (sync forms), and sync Meteor APIs like `Meteor.user()`,
  `Meteor.call()`, `Collection.save()`.
- Use: `findOneAsync`, `insertAsync`, `updateAsync`, `removeAsync`, `fetchAsync`,
  `countAsync`, `mapAsync`, `Meteor.userAsync()`, `saveAsync()`, etc. — each awaited.
- **Never skip `await`** on an async operation.

```javascript
// ❌ sync Mongo on server — invalid on Meteor 3
'orders.markPaid'(orderId) {
  OrdersCollection.update(orderId, { $set: { paid: true } });
}

// ✅ async method, awaited async op
async 'orders.markPaid'({ orderId }) {
  await OrdersCollection.updateAsync(orderId, { $set: { paid: true } });
}
```

---

## 6. Collections

Always define collections with `createCollection()` from `meteor/quave:collections`,
with a `SimpleSchema` for anything beyond the trivial case.

```javascript
import { createCollection } from 'meteor/quave:collections';
import SimpleSchema from 'simpl-schema';

const OrderSchema = new SimpleSchema({
  userId: String,
  status: String,
  total: Number,
});

export const OrdersCollection = createCollection({
  name: 'orders',
  schema: OrderSchema,
  indexes: [{ key: { userId: 1 } }],
});
```

**Write with `await Collection.saveAsync()`** rather than raw `insertAsync`/`updateAsync`:

- Without `_id` → inserts and stamps `createdAt`/`updatedAt`.
- With `_id` → updates and refreshes `updatedAt`.
- Returns the full document and validates against the schema.
- **Always `saveAsync()`, never sync `save()`** on the server (sync `save()` uses sync
  Mongo internally and is invalid on Meteor 3).

---

## 7. All mutations go through Meteor methods

Every data change happens in a Meteor **method on the server**. The client only reads
(publications + Minimongo) and calls methods. There is no client-side write path and no
simulation stub.

A method follows the same shape every time:

1. **Authenticate** — resolve and require the user.
2. **Validate input** — `check()` the arguments.
3. **Authorize** — guard access (permission check / ownership filter).
4. **Do the work** — through `saveAsync()` / `*Async`.

```javascript
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { OrdersCollection } from './OrdersCollection';
import { checkUserPermission } from '../access/Access';

Meteor.methods({
  async 'orders.updateStatus'({ orderId, status }) {
    check(orderId, String);
    check(status, String);

    const userId = Meteor.userId();
    if (!userId) throw new Meteor.Error('unauthorized');

    // Ownership / permission guard — see §8
    const order = await OrdersCollection.findOneAsync({ _id: orderId, userId });
    if (!order) throw new Meteor.Error('not-found');

    await OrdersCollection.saveAsync({
      _id: orderId,
      status: OrderStatus[status].name,
    });
  },
});
```

---

## 8. Permission & ownership patterns

Authorization is explicit in every method. Two generic patterns:

**User-owned resources — filter by `userId`.** Scope the query so a user can only ever
touch their own documents; a missing result means "not found / not yours".

```javascript
const userId = Meteor.userId();
if (!userId) throw new Meteor.Error('unauthorized');

const resource = await ResourcesCollection.findOneAsync({ _id: resourceId, userId });
if (!resource) throw new Meteor.Error('not-found');
```

**Role / capability check — a `checkUserPermission`-style guard.** Centralize
authorization logic behind a named async guard and call it from the method. Keep the
policy explicit (which role/capability is required) rather than inferring access from
names or membership.

```javascript
// app/access/Access.js — a single place that owns authorization policy
export const checkUserPermission = async ({ userId, capability }) => {
  if (!userId) throw new Meteor.Error('unauthorized');
  const allowed = await userHasCapability({ userId, capability });
  if (!allowed) throw new Meteor.Error('forbidden');
};
```

```javascript
// in a method
await checkUserPermission({ userId, capability: 'orders.manage' });
```

Never trust a client-supplied `userId`; always take it from `Meteor.userId()` on the
server.

---

## 9. Input validation

Validate every method/publication argument at the boundary.

- Use `check()` from `meteor/check` for argument shape/types in methods and publications.
- Use `SimpleSchema` for collection documents (via `createCollection`'s `schema`), and
  validate structured payloads before persisting.
- For enum-valued fields, verify the value is a real enum key rather than trusting a raw
  string.

```javascript
import { check, Match } from 'meteor/check';

check(orderId, String);
check(quantity, Match.Integer);
check(note, Match.Maybe(String));
```

---

## 10. Quality gate

Before finishing any task, run the gate from the repo root:

```bash
meteor npm run quave-check
```

This runs Oxlint with `--fix` and Oxfmt over the codebase. Review any automatic
changes, then run `meteor npm run quave-check-ci` as the non-mutating final gate.
Do not mark work complete while that gate fails.

Install dependencies with `meteor npm install` (never bare `npm install`).

---

## 11. No dead or commented-out code

- Delete deprecated files outright and update every reference.
- Remove unused imports.
- Never commit commented-out code — rely on git history instead.
- Re-read your diff once before declaring done: no stale imports, no dead code, no leftover
  debugging.

---

## Safety rules — must not do

Agents and contributors must **not**:

- Commit secrets, tokens, credentials, or `.env` files. Warn if asked to.
- Use bare `npm` — always `meteor npm`.
- Use sync Mongo or sync Meteor APIs on the server (Meteor 3 forbids them).
- Skip `await` on an async operation.
- Write to Minimongo from the client or add client-side method simulation stubs — all
  mutations go through server methods.
- Use CommonJS (`require`, `module.exports`, `exports.*`) in app source.
- Hide an ordinary dependency behind a dynamic/lazy import, or put a static `import`
  inside a function/callback.
- Hardcode loose enum strings instead of `Enum.KEY.name`.
- Write TypeScript.
- Leave commented-out or dead code, or unused imports, in a commit.
- Force push (`--force` / `--force-with-lease`), rebase, squash-merge, or `reset --hard`.
  If a commit is already pushed, add a new commit instead of amending/rebasing.
- Push directly to `main`/`master` — always go through a PR.
- Edit `.git/config` or git identity settings.
