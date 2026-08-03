# Collections Schema Documentation

Keep this file as the human-readable inventory of application-owned MongoDB
collections. Update it in the same change that adds or modifies a collection,
schema, index, retention rule, or important relationship.

This file complements executable schemas. It does not replace SimpleSchema,
indexes, validation, authorization, or tests.

## Repository conventions

- Create collections with `createCollection()` from `meteor/quave:collections`.
- Use SimpleSchema for application-owned documents.
- Use async database APIs on the server.
- Put persistent client mutations behind validated, authorized Meteor methods.
- Create indexes in the collection's async `apply(collection)` hook.
- Document external databases separately from application-owned MongoDB data.

## Entry template

Copy this section for each collection.

```markdown
## `collectionName`

**Purpose:** What the collection owns and why it exists.

**File:** `app/<domain>/<Name>Collection.js`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `_id` | String | yes | MongoDB document identifier. |

**Indexes**

| Keys | Options | Query supported |
| --- | --- | --- |
| `{ exampleId: 1 }` | `{}` | Briefly name the query or sort. |

**Relationships and lifecycle:** Describe ownership, references, creation,
updates, deletion or retention, and migration considerations.
```

## Collections

Add the application's collections below this line.
