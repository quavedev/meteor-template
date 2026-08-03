# Enum conventions

This is the single reference for creating, storing, and using enums anywhere in this
repo. Read it before you create a new enum, add a value to an existing enum, store an
enum value in a collection, or compare an enum value in code.

## TL;DR — The One Rule You Must Not Break

**Never use loose strings for enum values. Always reference the enum entry via `.name`
(or `.value` when the enum has a `value` property).**

```javascript
if (status === OrderStatus.SHIPPED.name) { /* ... */ }   // ✅
if (status === 'SHIPPED') { /* ... */ }                   // ❌ Loose string

saveOrder({ status: OrderStatus.PENDING.name });          // ✅
saveOrder({ status: 'PENDING' });                         // ❌ Loose string

const level = LogLevels.ERROR.value;                      // ✅ (enum has `value`)
const level = 'error';                                    // ❌ Loose string
```

This applies to **every** enum in the project. Loose strings bypass IDE refactoring,
hide broken references when a key is renamed, and defeat grep-based coverage audits.
If you catch yourself typing a bare `'SOME_STATUS'` string, stop and reference the
enum instead.

## The `createEnum` Factory

Enums are built with the `createEnum` helper from the `@quave/enum` package (the
canonical Quave enum utility, zero dependencies).

Install once (already a dependency if `@quave/enum` is in `package.json`):

```bash
meteor npm install @quave/enum
```

Import and use it:

```javascript
import { createEnum } from '@quave/enum';

export const OrderStatus = createEnum({
  PENDING: { label: 'Pending' },
  PROCESSING: { label: 'Processing' },
  SHIPPED: { label: 'Shipped' },
  DELIVERED: { label: 'Delivered' },
});
```

`createEnum` takes a plain object and returns the same shape, but every entry is
augmented with two auto-generated fields:

- **`name`** — the key itself (e.g. `'PENDING'`)
- **`index`** — the declaration order (0, 1, 2, ...)

```javascript
// Result of the OrderStatus definition above:
OrderStatus.PENDING;        // { name: 'PENDING', index: 0, label: 'Pending' }
OrderStatus.SHIPPED.name;   // 'SHIPPED'
OrderStatus.SHIPPED.index;  // 2
OrderStatus.SHIPPED.label;  // 'Shipped'
```

You can also pass `defaultFields` that are merged into every entry (per-entry values
override the default):

```javascript
export const Permissions = createEnum(
  {
    VIEWER: { label: 'Viewer' },
    EDITOR: { label: 'Editor', canEdit: true },
    ADMIN: { label: 'Admin', canEdit: true, canDelete: true },
  },
  { defaultFields: { canEdit: false, canDelete: false } }
);

Permissions.VIEWER.canEdit; // false (from defaultFields)
Permissions.EDITOR.canEdit; // true  (overridden)
```

## File Locations

Enums must be importable by **both client and server** code, so they live under `app/`,
where Meteor loads modules for both bundles.

| Location | Purpose |
|----------|---------|
| `app/<domain>/<EnumName>.js` | Enum owned by a single domain (co-locate it with that domain's collection/logic). |
| `app/enums/<EnumName>.js` | Cross-domain enum used by several domains (create the folder when the first one appears). |

Prefer co-location. Put `OrderStatus` next to the orders collection
(`app/orders/OrderStatus.js`); only promote an enum to `app/enums/` once it is genuinely
shared across domains. One enum per file, named after the enum.

```javascript
// app/orders/OrderStatus.js
import { createEnum } from '@quave/enum';

export const OrderStatus = createEnum({ /* ... */ });
```

```javascript
// Consuming it elsewhere (client or server)
import { OrderStatus } from '../orders/OrderStatus';
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Enum name | PascalCase (singular or plural, be consistent) | `OrderStatus`, `LogLevels`, `UserRoles` |
| File name | Matches the enum name | `OrderStatus.js` |
| Keys | SCREAMING_SNAKE_CASE | `PENDING`, `IN_TRANSIT`, `OUT_OF_STOCK` |
| `label` | Human-readable | `'Pending'`, `'Out of Stock'` |
| `value` | lowercase / snake_case (only when needed — see below) | `'error'`, `'out_of_stock'` |

## When to Use the `value` Property

The decision rule: **do we control the stored data format, or does an external system?**

### Without `value` (default) — We Control the Data

When we define and store our own data, the DB stores the KEY (identical to `.name`), so
we have full control over the format and renames stay safe.

```javascript
export const OrderStatus = createEnum({
  PENDING: { label: 'Pending' },   // DB stores: "PENDING"
  SHIPPED: { label: 'Shipped' },   // DB stores: "SHIPPED"
});
```

### With `value` — An External System Controls the Data

When data comes from or must match an external system (a third-party API, a legacy
database, a protocol, OAuth scopes), we can't pick the format. Use `value` to match
exactly what the external system requires.

```javascript
export const LogLevels = createEnum({
  ERROR: { value: 'error', label: 'Error', severity: 1 },
  WARN:  { value: 'warn',  label: 'Warning', severity: 2 },
  INFO:  { value: 'info',  label: 'Info', severity: 3 },
});
```

**Use `value` when:** an external system dictates the format, you must match an API
contract you don't control, or you need compatibility with pre-existing data. If none
of those apply, **do not add `value`** — keys are simpler and rename-safe.

## Storing Enums in Mongo (SimpleSchema)

Collections in this repo use `createCollection` from `meteor/quave:collections` with a
`simpl-schema` schema. Drive `allowedValues` and `defaultValue` from the enum — never
hand-type the strings.

### Standard enums (no `value`) — store the KEY

Use `Object.keys()` for `allowedValues` and `.name` for `defaultValue`:

```javascript
import { createCollection } from 'meteor/quave:collections';
import SimpleSchema from 'simpl-schema';
import { OrderStatus } from './OrderStatus';

const OrderSchema = new SimpleSchema({
  status: {
    type: String,
    defaultValue: OrderStatus.PENDING.name,        // "PENDING"
    allowedValues: Object.keys(OrderStatus),       // ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]
  },
});

export const OrdersCollection = createCollection({
  name: 'orders',
  schema: OrderSchema,
});
```

### Enums with `value` — store the VALUE

Use `Object.values().map()` for `allowedValues` and `.value` for `defaultValue`:

```javascript
import { LogLevels } from '../enums/LogLevels';

const LogEntrySchema = new SimpleSchema({
  level: {
    type: String,
    defaultValue: LogLevels.INFO.value,                          // "info"
    allowedValues: Object.values(LogLevels).map(({ value }) => value), // ["error", "warn", "info"]
  },
});
```

## Accessing Enum Properties

### Direct access (when you know the key)

```javascript
const status = OrderStatus.SHIPPED.name;   // "SHIPPED"
const label  = OrderStatus.SHIPPED.label;  // "Shipped"
const level  = LogLevels.ERROR.value;      // "error"
```

### Dynamic access (from a database value)

For standard enums the stored value is the key, so look it up directly:

```javascript
const statusFromDb = order.status;            // "SHIPPED"
const statusEnum   = OrderStatus[statusFromDb];
const label        = statusEnum.label;        // "Shipped"

// Safe access with optional chaining + fallback
const label = OrderStatus[order.status]?.label || order.status;
```

### Finding by value (enums with `value`)

Because the stored value is not the key, resolve it by scanning values. Export a small
helper from the enum file:

```javascript
// In LogLevels.js
export const getLogLevelByValue = (value) =>
  Object.values(LogLevels).find((level) => level.value === value);

const level = getLogLevelByValue('warn'); // WARN entry
```

## Comparing Enum Values

Always compare against `.name` (or `.value`), never a literal:

```javascript
if (order.status === OrderStatus.SHIPPED.name) { /* ... */ }   // ✅
if (order.status === 'SHIPPED') { /* ... */ }                  // ❌
```

Prefer **boolean flags** on the enum over chains of string comparisons. Attach the flag
in the definition and read it after a dynamic lookup:

```javascript
export const OrderStatus = createEnum({
  PENDING:    { label: 'Pending',    canCancel: true,  canEdit: true },
  PROCESSING: { label: 'Processing', canCancel: true,  isInProgress: true },
  SHIPPED:    { label: 'Shipped',    isInProgress: true },
  DELIVERED:  { label: 'Delivered',  isComplete: true },
});

const status = OrderStatus[order.status];
if (status.canCancel)    showCancelButton();   // ✅ expressive, centralized
if (status.isInProgress) showTracker();

// Prefer the above over:
// if (order.status === 'PENDING' || order.status === 'PROCESSING') { ... }  ❌
```

## Iterating Over Enums

```javascript
// All entries
const allStatuses = Object.values(OrderStatus);

// All keys
const allKeys = Object.keys(OrderStatus);

// Filter by property
const cancelable = Object.values(OrderStatus).filter((s) => s.canCancel);

// Map to values (validation arrays / helper exports)
export const LOG_LEVEL_VALUES = Object.values(LogLevels).map(({ value }) => value);

// Build UI options (e.g. a <select>)
const options = Object.values(OrderStatus).map(({ name, label }) => ({
  value: name,
  label,
}));
```

## Common Patterns

### Referencing other enums

Enums can reference keys from another enum to keep related data in sync (store the
`.name`, not a literal):

```javascript
import { Categories } from './Categories';

export const Products = createEnum({
  LAPTOP:  { label: 'Laptop',  category: Categories.ELECTRONICS.name },
  T_SHIRT: { label: 'T-Shirt', category: Categories.CLOTHING.name },
});
```

### Helper exports

Co-locate `getXByValue` and `X_VALUES` helpers with the enum they belong to:

```javascript
export const LogLevels = createEnum({ /* ... */ });

export const getLogLevelByValue = (value) =>
  Object.values(LogLevels).find((level) => level.value === value);

export const LOG_LEVEL_VALUES = Object.values(LogLevels).map(({ value }) => value);
```

## Tooling

- Install / manage packages with `meteor npm` (e.g. `meteor npm install @quave/enum`).
- Lint and format with the repo scripts: `meteor npm run quave-check`
  (Oxlint + Oxfmt), then verify with `meteor npm run quave-check-ci`.

## Quick Reference

| Task | Pattern |
|------|---------|
| Create enum | `export const Name = createEnum({ KEY: { label: '...' } })` |
| Import factory | `import { createEnum } from '@quave/enum'` |
| Get key/name | `EnumName.KEY.name` |
| Get value | `EnumName.KEY.value` |
| Dynamic access | `EnumName[statusString]` |
| DB `allowedValues` (key) | `Object.keys(EnumName)` |
| DB `allowedValues` (value) | `Object.values(EnumName).map(({ value }) => value)` |
| DB `defaultValue` (key) | `EnumName.KEY.name` |
| DB `defaultValue` (value) | `EnumName.KEY.value` |
| Filter entries | `Object.values(EnumName).filter((e) => e.prop)` |
| Find by value | `Object.values(EnumName).find((e) => e.value === val)` |
| Compare | `x === EnumName.KEY.name` (never a literal) |
</content>
