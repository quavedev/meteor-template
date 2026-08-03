# Meteor conventions

This is the canonical guide for Meteor architecture in applications generated from this
template. It covers client/server runtime boundaries, Mongo and Minimongo, collections,
publications and subscriptions, methods, reactive client reads, server APIs, and module
loading.

The template runs **Meteor 3.5**, so server code uses async APIs. Avoiding removed Meteor
2 APIs is an important compatibility requirement, but it is only one part of the broader
architecture documented here.

Meteor 3 migration reference: https://v3-migration-docs.meteor.com/

---

## Architecture at a glance

- **Server is async-only.** Every DB read/write and every `Meteor` server API uses the
  `*Async` variant with `await`. Every Meteor method is declared `async`.
- **Client (browser) is sync-friendly.** React components under `app/` read from
  **Minimongo** with the sync cursor API (`find`, `findOne`, `fetch`) — that is expected,
  safe, and preferred so render paths and small handlers stay simple.
- **No isomorphic data access.** Never share a function that queries or writes Mongo on
  the server and Minimongo on the client. Server-only publications read Mongo; client-only
  code subscribes and then reads Minimongo. Server-only methods own persistent mutations.
  Do not use runtime branches to make one data-access module serve both environments, and
  do not rely on Meteor's method *simulation* (the client stub) for correctness.
- **All mutations go through Meteor methods on the server.** Never write to Minimongo
  directly from the client, and never add client-side `allow`/`deny` inserts. The only way
  data changes is: client `Meteor.callAsync('name', args)` → server `async` method →
  `await Collection.saveAsync()` / `*Async` write.

### Where code runs in this repo

| Location | Runs on | Style |
|---|---|---|
| `client/` | browser only | sync Minimongo OK |
| React components under `app/` (e.g. `app/home/Home.js`) | browser | sync Minimongo OK; mutate via `Meteor.callAsync` |
| `server/` | server only | `*Async` + `await` |
| `app/**/*Methods.js`, `app/**/*Publishes.js` | server (source of truth) | `async` + `await` |
| Collection defs (`app/**/*Collection.js`) | both bundles | declarative schema/helpers only; no queries or writes |
| Pure utilities, schemas, constants, and enums | either or both | safe to share only when they do not access Mongo/Minimongo or Meteor data APIs |

The code paths remain deliberately different even though both sides import the same
collection definition:

```text
server publication -> Mongo query -> published documents
client subscription -> Minimongo find/findOne -> reactive UI
client callAsync -> server method -> validated/authorized Mongo write
```

Never place a `Collection.find*`, `insert*`, `update*`, `remove*`, `upsert*`, or `save*`
call in a module imported by both client and server. Never put `Meteor.publish`,
`Meteor.subscribe`, `useSubscribe`, or a method implementation in shared code.

When a module can be reached from both bundles, remove all data access from it and move
that logic to an explicitly client-only or server-only module. Do not solve ambiguous
placement by choosing one API form for both environments.

---

## Server-side MongoDB

```javascript
// ❌ BANNED — removed from the server in Meteor 3
Collection.findOne({ _id });
Collection.find(query).fetch();
Collection.find(query).forEach(fn);
Collection.find(query).map(fn);
Collection.find(query).count();
Collection.insert(doc);
Collection.update(selector, modifier);
Collection.remove(selector);
Collection.upsert(selector, modifier);

// ✅ REQUIRED
await Collection.findOneAsync({ _id });
await Collection.find(query).fetchAsync();
await Collection.find(query).forEachAsync(fn);
await Collection.find(query).mapAsync(fn);
await Collection.find(query).countAsync();
await Collection.insertAsync(doc);
await Collection.updateAsync(selector, modifier);
await Collection.removeAsync(selector);
await Collection.upsertAsync(selector, modifier);
```

### `find()` itself is still sync

`Collection.find(query)` returns a **cursor** — it is not async and needs no `await`. Only
the **terminal** methods on the cursor convert (`fetchAsync`, `forEachAsync`, `mapAsync`,
`countAsync`).

```javascript
// ✅ CORRECT — find() is sync, fetchAsync() is the async terminal
const docs = await Collection.find(query).fetchAsync();

// ❌ WRONG — awaiting find() does nothing useful
const docs = await Collection.find(query);
```

### Always `await` — a missing `await` is silent data loss

Meteor 3 has **no Fibers**. An un-awaited `*Async` call is a fire-and-forget Promise: the
caller keeps going, the write may not have landed, and a read can return a Promise instead
of a document.

```javascript
// ❌ DANGEROUS — not awaited, next read may see stale data
Collection.updateAsync(id, { $set: { count } });
const doc = await Collection.findOneAsync(id); // may return the old doc

// ✅ CORRECT — awaited, the write completes before the read
await Collection.updateAsync(id, { $set: { count } });
const doc = await Collection.findOneAsync(id); // returns the updated doc
```

| Missing `await` on… | Result |
|---|---|
| Write (`updateAsync`, `insertAsync`, `saveAsync`) | Write may never complete — **data loss** |
| Read (`findOneAsync`) | Returns a Promise, not the document — **logic errors** |
| Any async function returning a value | Caller gets a Promise, not the value |

This matters even in **methods that are already `async`** — audit every call inside them, not
just the signature. And it matters in **collection hooks** (`after.insert`/`after.update`/
`after.remove`): the hook must be `async` and must `await` every write.

### Parallel work: `Promise.all` + `map`, not `await` in a loop

```javascript
// ❌ Avoid — sequential awaits in a loop
for (const { _id } of items) {
  await Collection.removeAsync(_id);
}

// ✅ Parallel
await Promise.all(items.map(({ _id }) => Collection.removeAsync(_id)));
```

If the work truly must be sequential, add a comment saying why.

---

## Collections — `createCollection()` + `saveAsync()`

Collections are created with `createCollection()` from `meteor/quave:collections`
(schema via `simpl-schema`, plus optional `helpers`):

```javascript
import { createCollection } from 'meteor/quave:collections';
import SimpleSchema from 'simpl-schema';

const ClickSchema = new SimpleSchema({
  count: { type: SimpleSchema.Integer, defaultValue: 0 },
});

export const ClicksCollection = createCollection({
  name: 'clicks',
  schema: ClickSchema,
  helpers: {
    getCountText() {
      return `${this.count}x`;
    },
  },
});
```

`quave:collections` exposes a `save()` convenience method that uses **sync** Mongo
internally — that is **invalid on the server** in Meteor 3. Because `save` is a custom name
it is easy to miss. Always use the async form:

```javascript
// ❌ BANNED on the server — sync save()
const doc = MyCollection.save({ name: 'foo' });

// ✅ REQUIRED — uses *Async Mongo calls internally
const doc = await MyCollection.saveAsync({ name: 'foo' });
```

---

## Meteor methods

Every method is `async`. The method is the **only** place a mutation happens: validate,
then write with `*Async`.

```javascript
// app/clicks/clicksMethods.js  (server source of truth)
import { Meteor } from 'meteor/meteor';
import { ClicksCollection } from './ClicksCollection';
import { UsersCollection } from '../users/UsersCollection';

Meteor.methods({
  'clicks.increment': async function incrementCount() {
    await ClicksCollection.upsertAsync({}, { $inc: { count: 1 } });
  },

  'clicks.doubleForGmail': async function doubleForGmail() {
    const { userId } = this;
    const user = await UsersCollection.findOneAsync(userId); // ← userAsync-style read
    if (!user?.emails?.[0]?.address.includes('@gmail')) {
      throw new Meteor.Error('not-allowed', 'Only for gmail users');
    }
    await ClicksCollection.upsertAsync({}, { $inc: { count: 2 } });
  },
});
```

```javascript
// ❌ BANNED — sync method body, sync Mongo
Meteor.methods({
  myMethod() {
    return Collection.findOne({ _id }); // findOne doesn't exist on the server
  },
});
```

---

## Publications, subscriptions, and reactive client reads

React reads Minimongo **synchronously** and mutates by **calling the method**. It never
touches Minimongo write APIs directly.

```javascript
// app/home/Home.js  (browser)
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useFind } from 'meteor/react-meteor-data';
import { ClicksCollection } from '../clicks/ClicksCollection';

export function Home() {
  useSubscribe('countData');

  // ✅ sync Minimongo read — no await in render
  const documents = useFind(() => ClicksCollection.find(), []);
  const clickDocument = documents[0];

  const onCount = async () => {
    // ✅ mutation goes through the server method
    await Meteor.callAsync('clicks.increment');
  };

  // ❌ NEVER: ClicksCollection.upsert(...) / .insert(...) directly on the client
  // ❌ NEVER: rely on the method's client simulation to "write" for real

  return <button onClick={onCount}>{clickDocument?.getCountText()}</button>;
}
```

### `Meteor.call` → `Meteor.callAsync`

```javascript
// ❌ BANNED — callback style
Meteor.call('clicks.increment', (err, res) => { /* ... */ });

// ❌ AVOID — sync call against an async stub warns
Meteor.call('clicks.increment');

// ✅ REQUIRED
const result = await Meteor.callAsync('clicks.increment');
```

---

## Other server APIs that need `*Async`

```javascript
// Current user (server)
const user = Meteor.user();          // ❌ banned on the server
const user = await Meteor.userAsync(); // ✅
// Meteor.userId() (sync) is still fine everywhere.

// Accounts
Accounts.setPassword(userId, pw);            // ❌
await Accounts.setPasswordAsync(userId, pw); // ✅
Accounts.addEmail(userId, email);            // ❌
await Accounts.addEmailAsync(userId, email); // ✅

// Assets
Assets.getText('file.txt');            // ❌
await Assets.getTextAsync('file.txt'); // ✅
Assets.getBinary('f.bin');             // ❌
await Assets.getBinaryAsync('f.bin');  // ✅
```

**Publications** that do async work must be `async`:

```javascript
Meteor.publish('countData', async function () {
  // async operations are fine here
  return ClicksCollection.find();
});
```

**WebApp (Connect/Express):** prefer `WebApp.handlers` over `WebApp.connectHandlers`, and
`WebApp.rawHandlers` over `WebApp.rawConnectHandlers`.

---

## Meteor 2 migration guard: removed APIs

Meteor 3 has no Fibers. These are gone:

- `Promise.await()` → native `await`
- `Fibers` / `Future` → native `async/await`
- `Meteor.wrapAsync()` → native `async/await`

---

## Modules: ESM-only, static by default

App source is **ESM-only**. Never use CommonJS in app code: no `module.exports`, no
`exports.*`, no `require()`. (Node/tool config files such as `rspack.config.js` and
`postcss.config.mjs` are the only exceptions.)

Use top-level `import` for normal dependencies. Use dynamic `import()` **only** to break a
circular dependency or to lazy-load heavy / server-only code — and even then via a small
top-level `loadX()` helper that returns `import(...)`, awaited inside an `async` function.
Never use `require()` as a lazy import, and never hide an ordinary dependency behind a
nested lazy load.

```javascript
// ✅ normal, static
import { ClicksCollection } from './ClicksCollection';

// ✅ reviewed lazy boundary (cycle break / heavy server-only code)
const loadReport = () => import('./heavyServerReport');
async function run() {
  const { buildReport } = await loadReport();
  return buildReport();
}

// ❌ never
const x = require('./x');
```

---

## Server API quick reference

| Banned sync on server | Required (Meteor 3 async) |
|---|---|
| `Collection.findOne()` | `await Collection.findOneAsync()` |
| `cursor.fetch()` | `await cursor.fetchAsync()` |
| `cursor.forEach()` | `await cursor.forEachAsync()` |
| `cursor.map()` | `await cursor.mapAsync()` |
| `cursor.count()` | `await cursor.countAsync()` |
| `Collection.insert()` | `await Collection.insertAsync()` |
| `Collection.update()` | `await Collection.updateAsync()` |
| `Collection.remove()` | `await Collection.removeAsync()` |
| `Collection.upsert()` | `await Collection.upsertAsync()` |
| `Collection.save()` (quave:collections) | `await Collection.saveAsync()` |
| `Meteor.call()` (callback / sync) | `await Meteor.callAsync()` |
| `Meteor.user()` (server) | `await Meteor.userAsync()` |
| `Accounts.setPassword()` | `await Accounts.setPasswordAsync()` |
| `Accounts.addEmail()` | `await Accounts.addEmailAsync()` |
| `Assets.getText()` | `await Assets.getTextAsync()` |
| `Assets.getBinary()` | `await Assets.getBinaryAsync()` |
| `Meteor.wrapAsync()` | native `async/await` |
| `Promise.await()` | native `await` |
| sync method body (`myMethod() {}`) | `async myMethod() {}` |
| client-side Minimongo write | `Meteor.callAsync` → server method → `*Async` write |

> `Collection.find(query)` (the cursor) stays sync everywhere — only its terminal methods
> convert.

Commands in this repo are prefixed `meteor npm` (e.g. `meteor npm run start`); never use
bare `npm` inside the Meteor app.
