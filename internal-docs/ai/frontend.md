# Frontend reference

Read this before touching anything user-facing under `app/` — React components,
routing, layouts, styling, theme tokens, alerts, or reactive data wiring.

Companion docs:

- [`coding-style.md`](./coding-style.md) — universal coding rules (JS-only, named
  functions/params, feature folders, enums-not-loose-strings).
Applications generated from this repository use **Meteor 3.5 + React 19 (React
Compiler) + Tailwind CSS 4**. Application source is JavaScript, not TypeScript. The
client reads reactively from Minimongo with its synchronous APIs; persistent mutations
go through validated and authorized Meteor methods.

> **Reminder:** never run bare `npm`. Use `meteor npm ...` so the bundled Node/npm is
> used and the lockfile stays valid.

## Table of contents

1. [Where everything lives](#where-everything-lives)
2. [Component organization (feature folders)](#component-organization-feature-folders)
3. [Tailwind v4 setup](#tailwind-v4-setup)
4. [Theme tokens — colors, fonts, sizes](#theme-tokens--colors-fonts-sizes)
5. [Responsive design — mandatory](#responsive-design--mandatory)
6. [Component patterns and class merging](#component-patterns-and-class-merging)
7. [Routing and layouts](#routing-and-layouts)
8. [Reactive data (sync Minimongo + methods)](#reactive-data-sync-minimongo--methods)
9. [Alerts and messages](#alerts-and-messages)
10. [Modals and confirmations](#modals-and-confirmations)
11. [Enums drive UI labels — never loose strings](#enums-drive-ui-labels--never-loose-strings)
12. [Icons](#icons)
13. [React 19 + React Compiler](#react-19--react-compiler)
14. [Must-not-do checklist](#must-not-do-checklist)
15. [Quality gate](#quality-gate)

## Where everything lives

| Path | Purpose |
|------|---------|
| `client/main.js` | Client entry. Mounts `<App />` into `#app` inside `<StrictMode>`, imports `./main.css`. |
| `client/main.css` | **Single Tailwind v4 entry point.** `@import 'tailwindcss'` + all theme tokens, custom utilities, base rules. |
| `postcss.config.mjs` | PostCSS chain — just `@tailwindcss/postcss`. Nothing else. |
| `app/general/App.js` | Root component. Wires `BrowserRouter`, `Suspense`, `AlertProvider` + `<Alert />`, and the top-level `<Router />`. |
| `app/general/Router.js` | Route table. Maps `RoutePaths` to page components, each wrapped in a layout (`PublicLayout` / `AnonymousLayout` / `LoggedLayout`). |
| `app/general/RoutePaths.js` | **Single source of truth for every route path.** Always import from here; never hardcode a URL string. |
| `app/general/NotFound.js` | Catch-all `*` route. |
| `app/layouts/` | Layout shells — `ConditionalLayout` (auth gate) and its thin wrappers, plus `PageWithHeader` / `PageWithoutHeader`. |
| `app/components/` | Shared, reusable UI atoms (`Button`, `Loading`, `MyAlert`, `ErrorFallback`, …). |
| `app/<feature>/` | Feature/domain folders (`home/`, `access/`, `private/`, `status/`, `users/`, `clicks/`, …). A feature folder holds its page components, collections, methods, and publications. |
| `client/` · `server/` | Meteor entry folders. |

## Component organization (feature folders)

This app is organized **by feature/domain**, not by atomic-design layers. Group code by
what it's about, not by its technical type.

- **Shared UI primitives** → `app/components/`. Single-purpose, reusable, minimal props,
  no business logic. `Button`, `Loading`, `MyAlert`, `ErrorFallback` live here. Add new
  shared primitives here rather than re-inventing them inside a page.
- **Layout shells** → `app/layouts/`. Route-wrapping chrome and auth gating.
- **Routing + app root** → `app/general/`.
- **Everything else** → its **feature folder** (`app/home/`, `app/users/`, …). A page
  component, its collection (`*Collection.js`), its methods (`*Methods.js`), and its
  publications (`*Publishes.js`) live together in the feature folder.

**Where does a new component go?**

1. Reusable across features, no domain logic → `app/components/`.
2. Specific to one feature (a page, a section, a widget) → that feature's folder.
3. Layout/route chrome → `app/layouts/` or `app/general/`.

**Naming:** PascalCase component files with a matching named export
(`export function Home()` / `export const Button = ...`). Follow the nearest sibling.
Collections/methods/publishes follow `{Entity}Collection.js`, `{entity}Methods.js`,
`{entity}Publishes.js` (see [`coding-style.md`](./coding-style.md)).

## Tailwind v4 setup

**Tailwind v4 is in use — not v3.** There is no `tailwind.config.js` and no
`postcss.config.js`. Everything is CSS-first, driven from `client/main.css`.

`client/main.css` today is minimal:

```css
@import 'tailwindcss';

/* Base styles */
html, body, #app {
  @apply min-h-screen bg-white text-gray-900;
}
```

`postcss.config.mjs` is the whole PostCSS chain:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Practical rules:

- **Define theme tokens in `client/main.css`** inside an `@theme { … }` block — never in
  a JS config, never as inline hex values in components. New colors, fonts, sizes, radii,
  breakpoints all go there (see next section).
- **Use `@apply` only inside a `@layer components` / `@utility` block** in `main.css`,
  not scattered across ad-hoc component strings.
- **PostCSS stays as-is** — only `@tailwindcss/postcss`. Don't add Autoprefixer / cssnano;
  Tailwind v4 (Lightning CSS) handles those.
- **Vendor JS that ships Tailwind class strings** must be made visible to the v4 scanner
  with an `@source '…'` line in `main.css`, or the JIT won't emit those classes.
- In Tailwind v4, force-generate a genuinely dynamic class with
  `@source inline("…")` in `main.css`. Do not introduce a separate legacy safelist file.

## Theme tokens — colors, fonts, sizes

> **State of the template:** `main.css` currently ships only a minimal light base
> (`bg-white text-gray-900`) and the pages use Tailwind's stock `indigo`/`gray` palette.
> There is **no custom `@theme` block yet.** When you establish this product's visual
> theme, add the tokens here first — don't sprinkle raw utilities and hex values across
> components. If the generated product wants dark mode, define it as tokens in `@theme`
> and flip the base rule accordingly rather than hardcoding dark colors per component.

Define the palette and type scale once, in `@theme`, and reference them everywhere as
normal Tailwind utilities (`bg-*`, `text-*`, `border-*`, `ring-*`, `from-*`/`to-*`, …):

```css
@theme {
  /* Colors — every stop becomes bg-brand-500, text-brand-500, etc. */
  --color-brand-500: #4f46e5;
  --color-brand-600: #4338ca;
  --color-surface: #ffffff;
  --color-danger-500: #dc2626;

  /* Fonts */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;

  /* Font weights */
  --font-weight-medium: 500;

  /* Semantic text sizes — prefer these over raw text-sm/text-xl when a scale exists */
  --text-h1: 2.25rem;
  --text-body: 1rem;

  /* Radii */
  --radius-card: 0.75rem;

  /* Extra breakpoints, if the viewport ladder needs them */
  --breakpoint-xsm: 480px;
}
```

Guidelines:

- **Add a token before using a color/size widely.** Never hardcode a hex value in JSX —
  add `--color-*` to `@theme`, then use `bg-brand-500`. Ad-hoc alpha tints
  (`bg-brand-500/40`) are fine; promote a tint to a named token once it's reused ~3×.
- **Prefer semantic tokens** (`--text-h1`, `--radius-card`) over memorizing raw scales, so
  the whole app moves together when the design changes.
- Fonts loaded globally (via `client/main.html` or an `@import`/`<link>`) should be wired
  into `--font-sans` so `font-sans` (the default body font) picks them up.

## Responsive design — mandatory

**Every UI change must work on a phone (~320px wide) and on desktop.** "Looks right on my
laptop" is half-done — a layout that breaks on mobile is a bug, not missing polish.

Work **mobile-first**: write the small-screen styles unprefixed, then layer larger
breakpoints on top. **Prefer container queries** (`@container` + `@sm:`/`@md:`/… variants)
for components whose width is driven by their parent panel rather than the viewport;
fall back to viewport variants (`sm:`/`md:`/`lg:`/…) for true viewport-level chrome.

```jsx
// A component that adapts to its own container's width
<div className="@container">
  <div className="flex flex-col gap-4 @md:flex-row @md:items-center">…</div>
</div>
```

Checklist for any UI change:

- **Data tables must go responsive, not squeezed.** A fixed-width `<table>` crams columns
  to one character per line on a phone. Use the **responsive-table pattern**: below a
  breakpoint, collapse each row into a stacked, labelled block; above it, render a normal
  table. Concretely, label each cell and let CSS switch layouts:

  ```jsx
  // Each cell carries its column label; the grid stacks on mobile, tabulates on desktop.
  <div className="grid grid-cols-1 gap-2 @md:grid-cols-4">
    <div className="flex justify-between @md:block">
      <span className="font-medium text-gray-500 @md:hidden">Name</span>
      <span>{row.name}</span>
    </div>
    {/* …one block per column… */}
  </div>
  ```

  Horizontal scroll (`overflow-x-auto`) is acceptable only for genuinely tabular,
  many-column data (comparison matrices, dense admin grids) or inside a modal/portal where
  container queries don't resolve.
- **Multi-column form rows must stack.** Use `flex flex-col gap-4 @sm:flex-row`
  (or `grid grid-cols-1 @sm:grid-cols-2`). Never a bare `flex gap-2` / `grid grid-cols-2`
  that stays multi-column and crams labels on a phone.
- **Right-align row actions** (`justify-end` at the larger breakpoint) so the rightmost
  button stays aligned across rows even when some rows hide an action.
- **Long / user-entered text wraps with `break-words`**, not `break-all` (which wraps
  character-by-character once a column narrows).

**Validate across widths before shipping.** A docked desktop browser can't produce a true
mobile viewport (`window.innerWidth` stays desktop-wide), so just resizing a window is not
a real mobile test. Check the component at ~320px, a tablet width, and desktop against the
actual compiled theme — via responsive dev-tools device emulation or by rendering the
component at fixed widths — and confirm tables, form rows, and actions all behave.

## Component patterns and class merging

**Functional, named, single object-param.** Every component is a named function taking one
props object, so call sites are self-documenting:

```jsx
export const Button = ({ primary = false, secondary = false, children, ...rest }) => {
  const style = primary ? styles.primary : secondary ? styles.secondary : styles.primary;
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md border px-5 py-3 ${style}`}
      {...rest}
    >
      {children}
    </button>
  );
};
```

Class-string handling:

- Short, static class strings → template literals (what `Button.js` does today).
- **When a component takes a `className` that should override its defaults**, merge with
  Tailwind-awareness so the consumer's utility actually wins over the default. If you add
  the deps, `tailwind-merge` (`twMerge`) resolves conflicts and `classnames` handles
  boolean toggles:

  ```jsx
  import classNames from 'classnames';
  import { twMerge } from 'tailwind-merge';

  className={classNames(twMerge('inline-flex gap-2 p-4', className), {
    'opacity-50': disabled,
  })}
  ```

  (These aren't installed by default — plain template-literal concatenation is fine until
  a component genuinely needs override-merging.)
- **Reach for the shared primitive** (`Button`, `Loading`, `MyAlert`, `ErrorFallback`)
  instead of re-styling a raw `<button>`/spinner inline. If one is missing, add it to
  `app/components/`.

## Routing and layouts

- **`react-router-dom` v6**, `BrowserRouter` mounted in `App.js`.
- **`RoutePaths` (`app/general/RoutePaths.js`) is the only place path patterns live.**
  Import from there; never hardcode `/private`, and use `generatePath(RoutePaths.X, params)`
  for parameterized routes.
- **`Router.js`** maps each `RoutePaths.*` entry to a page wrapped in a layout:

  ```jsx
  <Route
    path={RoutePaths.PRIVATE}
    element={<LoggedLayout><Private /></LoggedLayout>}
  />
  ```

- **Three layout wrappers**, all built on `ConditionalLayout`:
  - **`PublicLayout`** — open to everyone (home, status, not-found).
  - **`AnonymousLayout`** — `onlyAnonymous`: redirects logged-in users to the private area.
  - **`LoggedLayout`** — `onlyLogged`: redirects anonymous users to `RoutePaths.ACCESS`.
- **`ConditionalLayout`** reads `useLoggedUser()`, shows a `<Loading />` skeleton while the
  user is resolving, enforces the auth rule, then renders `PageWithHeader` or
  `PageWithoutHeader`. It also wraps content in an `ErrorBoundary` (`ErrorFallback`), so
  every route already has a boundary — don't add a competing top-level one; wrap a
  localized risky region in its own boundary if needed.
- Add a new route by: adding the path to `RoutePaths`, importing the page in `Router.js`,
  and wrapping it in the correct layout for its access level.

## Reactive data (sync Minimongo + methods)

Client UI code reads reactively from the local **Minimongo** cache and writes through
**Meteor methods**. Reads use the **sync** reactive APIs; mutations are async method calls.

```jsx
import { useSubscribe, useFind } from 'meteor/react-meteor-data';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { useAlert } from 'meteor/quave:alert-react-tailwind';
import { ClicksCollection } from '../clicks/ClicksCollection';

export function Home() {
  const { openAlert } = useAlert();
  const { loggedUser, isLoadingLoggedUser } = useLoggedUser();

  const isLoading = useSubscribe('countData');           // subscribe to a publication
  const clicks = useFind(() => ClicksCollection.find(), []); // reactive sync read

  const onIncrement = async () => {
    try {
      await Meteor.callAsync('clicks.increment');         // mutation via method
      openAlert('Incremented!');
    } catch (e) {
      openAlert(e.reason);                                // surface the server message
    }
  };
  // …
}
```

Rules:

- **Reads are reactive + sync:** `useSubscribe(name, ...args)` for the subscription,
  `useFind(() => Collection.find(...), deps)` for the cursor. `useFind` needs a **cursor**
  — never return `undefined` from the factory. Use `useTracker` for anything beyond a
  single cursor.
- **Mutations go through Meteor methods**, called with `Meteor.callAsync('name', args)`.
  Wrap in `try/catch` and route the error's `.reason` to `openAlert` (see
  [Alerts](#alerts-and-messages)).
- **Never call `*Async` Mongo write methods on the client**, and never call sync Mongo on
  the server. Client reads via sync Minimongo cursors; the server uses async Mongo.
- Collections are defined with `createCollection` from `meteor/quave:collections`
  (schema + helpers). Prefer **collection helpers** (`clickDocument.getCountText()`) for
  derived, display-facing values over recomputing in each component.
- `useLoggedUser()` (`meteor/quave:logged-user-react`) gives `{ loggedUser,
  isLoadingLoggedUser }` — gate UI on the loading flag before deciding logged-in vs. not.

## Alerts and messages

In-app transient messages use **`quave:alert-react-tailwind`**. The provider and viewport
are mounted once in `App.js`:

```jsx
<AlertProvider>
  <Alert Component={MyAlert} />
  <Router />
</AlertProvider>
```

- **`MyAlert` (`app/components/MyAlert.js`)** is the presentational alert (fixed
  top-right, auto-closes). Style it to match the app theme; it's the single place alert
  visuals live.
- From any component/hook: `const { openAlert } = useAlert();` then `openAlert('message')`.
  Use it for success confirmations and for surfacing method errors (`openAlert(e.reason)`).
- Keep alerts for transient feedback. For inline field validation, show the message on the
  field itself.

## Modals and confirmations

The template does **not** ship a modal/dialog primitive — there's only the alert system
above. When you need one:

- Build a small dialog component (a `fixed inset-0` overlay + centered panel) and put it in
  `app/components/` so it's shared, rather than re-implementing per page.
- Prefer a **single mount point + imperative open API** (one dialog host rendered near the
  app root, opened via a helper) over scattering ad-hoc `useState`-driven modals — it keeps
  z-index and focus handling in one place.
- Give overlays an explicit, consistent z-index and make sure the alert viewport sits
  **above** modals so feedback stays visible while a dialog is open.
- For a simple "are you sure?", a confirm dialog that returns a promise (resolve on
  confirm, reject/resolve-false on cancel) keeps call sites clean:
  `if (await confirmDelete()) { await Meteor.callAsync('x.remove', id); }`.

Until such a primitive exists, don't hand-roll one-off Radix/portal dialogs in each page —
add the shared component once.

## Enums drive UI labels — never loose strings

When a field has a fixed set of values, model it as an **enum** and drive UI text/branching
off the enum, never a bare string literal. Loose strings bypass refactors, hide broken
references, and defeat grep audits. (Full rule in
[`coding-style.md`](./coding-style.md#never-use-loose-enum-strings).)

```jsx
// ✅ compare and label through the enum
const LABELS = {
  [OrderStatus.DISPATCHED.name]: 'Dispatched',
  [OrderStatus.DELIVERED.name]: 'Delivered',
};
if (order.status === OrderStatus.DISPATCHED.name) { /* … */ }
return <Pill>{LABELS[order.status]}</Pill>;

// ❌ loose strings in the UI
if (order.status === 'DISPATCHED') { /* … */ }
return <Pill>Dispatched</Pill>;
```

Keep the label map next to the enum (or in the feature folder) so options, colors, and
copy stay in sync with the enum's members.

## Icons

The template ships no icon library. When you add one:

- **Deep-import each icon** you use (`import { faPlus } from '.../faPlus'`) rather than
  importing from the package root — root imports bundle the entire icon set and bloat the
  client.
- Size and color icons with Tailwind utilities (`h-5 w-5 text-brand-500`) so they follow
  the theme tokens.
- If an icon library injects its own runtime CSS, make sure it loses to Tailwind's
  utilities (e.g. import its stylesheet inside `@layer base` in `main.css`) so `h-*`/`w-*`
  sizing wins.

## React 19 + React Compiler

- The **React Compiler** is enabled (`babel-plugin-react-compiler`). Don't manually litter
  code with `useMemo`, `useCallback`, or `React.memo` for routine memoization. Write clean,
  rules-of-React-compliant components and add manual memoization only after profiling.
- Because the compiler relies on the Rules of React, **keep hooks unconditional and at the
  top level**, keep render pure (no side effects during render), and don't mutate props or
  state. If the lint rule flags a component, fix the pattern rather than disabling it.
- Follow the import rule from [`coding-style.md`](./coding-style.md): static top-level
  imports; no `import`/`require` inside functions, hooks, or conditionals.

## Must-not-do checklist

- ❌ Don't ship a UI change that breaks on a phone — see
  [Responsive design](#responsive-design--mandatory). Specifically:
  - ❌ Don't render a data table as a fixed-width `<table>` that squeezes columns on
    mobile — use the responsive-table (stacked-labelled-rows) pattern, or horizontal scroll
    only where genuinely tabular.
  - ❌ Don't ship multi-column form rows that stay multi-column on phones — stack them
    (`flex-col @sm:flex-row`, `grid-cols-1 @sm:grid-cols-N`).
  - ❌ Don't use `break-all` on user/long text — use `break-words`.
- ❌ Don't hardcode color hex values in JSX — add a token to `@theme` in `client/main.css`
  first, then use the utility.
- ❌ Don't add a `tailwind.config.js` / `postcss.config.js`, or extra PostCSS plugins —
  the v4 CSS-first setup is intentional.
- ❌ Don't hardcode route URLs — import `RoutePaths` and use `generatePath` for params.
- ❌ Don't bypass shared primitives (`Button`, `Loading`, `MyAlert`, `ErrorFallback`) or
  the layout wrappers when they already cover your case.
- ❌ Don't compare enum-backed values to string literals — use `Enum.KEY.name` / `.value`.
- ❌ Don't call `*Async` Mongo writes on the client, or sync Mongo on the server. Client
  reads via sync Minimongo; mutations via `Meteor.callAsync` methods.
- ❌ Don't introduce TypeScript in app code. JavaScript only.
- ❌ Don't put `import`/`require` inside functions, hooks, or conditionals — static
  top-level imports only.
- ❌ Don't manually over-memoize — the React Compiler handles it; don't disable its lint
  rule to work around a pattern issue.
- ❌ Don't import an entire icon package — deep-import each icon.

## Quality gate

Before declaring frontend work done, from the repo root:

```bash
meteor npm run quave-check   # Oxlint (--fix) + Oxfmt
```

This runs Oxlint with fixes and Oxfmt. Review the diff, then run
`meteor npm run quave-check-ci` and fix everything it reports.

A final manual check catches what lints can't: open the app, exercise the changed flow,
open/close any alert, and **verify the layout at ~320px, a tablet width, and desktop** —
tables collapse correctly, form rows stack, and row actions stay aligned.
