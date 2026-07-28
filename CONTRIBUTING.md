# Contributing to Grain

Thanks for taking the time to help. This guide covers how the project is put
together and what a change needs to clear before it can be merged.

## Getting set up

```bash
git clone https://github.com/rachanpadmanabha/grain-ui.git
cd grain-ui
nvm use          # Node 20; anything >= 18 works
npm install
npm run dev      # builds, then serves the docs site
```

## Everyday commands

| Command          | What it does                                       |
| ---------------- | -------------------------------------------------- |
| `npm run build`  | Builds `dist/` via the Makefile                    |
| `npm test`       | Runs the suite on Node's built-in test runner      |
| `npm run lint`   | ESLint, Prettier, and Stylelint                    |
| `npm run format` | Rewrites files to satisfy Prettier and ESLint      |
| `npm run size`   | Prints gzip/brotli sizes and enforces the budget   |
| `npm run verify` | Confirms every `package.json` entry point resolves |
| `npm run check`  | Everything above, in the order CI runs it          |

Run `npm run check` before opening a pull request. CI runs the same thing.

## How the project is laid out

```
src/
  tokens.css        Design tokens — the public theming contract
  base.css          Element defaults
  grain.css         Stylesheet entry; @imports define bundle order
  components/       One CSS file per component
    web-components/ The four custom elements
  internal/dom.js   Shared element plumbing
  index.js          ESM entry (npm)
  iife.js           Global entry (CDN <script>)
  grain.d.ts        Hand-written type definitions
scripts/            Build-adjacent checks
test/               node:test suites, linkedom for the DOM
docs/               The documentation site
```

## Principles worth knowing before you change things

**Semantic HTML is the API.** A new component should be reachable by writing
ordinary markup. Reach for `data-*` and `aria-*` attributes as the variant
surface; a new class name is usually a sign the element choice is wrong.

**No runtime dependencies.** The library ships zero dependencies and should stay
that way. Development tooling is fair game.

**CSS does presentation; JavaScript does behaviour.** If a component sets inline
styles, that styling belongs in a stylesheet where users can override it without
`!important`.

**Keyboard support is not optional.** Anything interactive needs the keyboard
interactions its ARIA pattern calls for, and a test covering them.

**Watch the budget.** `npm run size` fails the build when a distributable
outgrows its budget. If a change genuinely needs more room, raise the budget in
`scripts/size.js` in the same pull request and say why.

## Adding a component

1. Write `src/components/<name>.css` and add an `@import` to `src/grain.css` in
   the position you want it in the cascade.
2. If it needs behaviour, add `src/components/web-components/grain-<name>.js`,
   extend `GrainElement` from `src/internal/dom.js`, and export a
   `registerGrain<Name>` function.
3. Register it in `src/index.js` and add it to the namespace in `src/iife.js`.
4. Declare its types in `src/grain.d.ts`.
5. Add `test/<name>.test.js`.
6. Document it in `docs/components.html` and the README's component table.

### Two things that are easy to get wrong

Custom elements upgrade as soon as their **start tag** is parsed, so
`connectedCallback` can run before the children exist. Use `whenParsed` from
`src/internal/dom.js` rather than deferring to `requestAnimationFrame`, which
paints the un-initialised markup for a frame first.

Document-level listeners should be **shared, not per instance**. Use `delegate`
from `src/internal/dom.js` so a page with fifty dropdowns installs one listener
rather than fifty.

## Tests

Tests run on `node:test` with
[linkedom](https://github.com/WebReflection/linkedom) supplying the DOM.
`installDOM()` must be called before importing any component, because the
element classes bind to whichever `HTMLElement` exists at import time — which is
why component modules are pulled in with `await import(...)`.

linkedom deliberately lacks `requestAnimationFrame`, `matchMedia`,
`getComputedStyle`, and `Element.animate`. That is a feature: if a component
needs one of those, it is usually doing something CSS should be doing.

`test/ssr.test.js` installs no DOM at all, and guards against the package
throwing when a server renderer imports it.

## Commits and pull requests

Write the commit subject in the imperative mood ("Add tooltip arrow offset"),
and use the body to explain why the change is needed. Keep a pull request to one
logical change, and mention any user-visible change in `CHANGELOG.md` under
`Unreleased`.

## Releasing

Maintainers only:

1. Move the `Unreleased` entries in `CHANGELOG.md` under the new version.
2. `npm version <patch|minor|major>` — the Makefile and the banner read the
   version straight from `package.json`, so nothing else needs editing.
3. `git push --follow-tags`.

Pushing a `v*.*.*` tag publishes to npm with provenance. The workflow refuses to
publish if the tag and `package.json` disagree.
