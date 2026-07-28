# Changelog

All notable changes are documented here. This project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.2.0 - 2026-07-28

### Fixed

- **The `GrainUI` global never existed.** The bundle was built with
  `--global-name=GrainUI`, but the entry module exported nothing, so
  `window.GrainUI` was `undefined` on every CDN page. The global now carries
  all four element classes and the `register` helpers. `window.GrainToast`
  keeps working.
- **`grain-close` did not fire when a modal was dismissed with Escape.**
  Escape and `<form method="dialog">` close the native `<dialog>` without
  going through `close()`, so listeners missed those dismissals entirely. The
  component now listens for the dialog's own `close` event, which covers every
  path.
- **Tabs flashed every panel on load.** Initialisation was deferred to
  `requestAnimationFrame`, so the browser painted all panels stacked for one
  frame before the inactive ones were hidden. Tabs now initialise
  synchronously when their children are available.
- **Importing the package crashed server renderers.** `class X extends
  HTMLElement` throws when evaluated without a DOM, breaking Astro, Next.js,
  Nuxt, and SvelteKit during SSR. Elements now extend a base that degrades to
  an inert class off the browser.
- A click whose target was not an `Element` threw inside the modal's global
  click handler.
- Dropdowns could write `aria-expanded="undefined"` where `details.open` was
  not a boolean.

### Changed

- **Toast styling moved from JavaScript to CSS.** Toasts set twelve inline
  styles per instance and called `getComputedStyle` to read the animation
  duration. Presentation now lives in `src/components/toast.css`, so themes can
  restyle toasts without `!important`.
- **Toast announcements are now reliable.** A toast carried both
  `role="alert"` and `aria-live="polite"`, which contradict each other. The
  shared region is now the live region, and it is inserted before the first
  toast so assistive technology picks the message up.
- **Document listeners are shared instead of per instance.** Modals and
  dropdowns each installed their own `document` click handler, so a page with
  fifty dropdowns ran fifty handlers on every click. Both now use one
  delegated listener whose cost does not grow with the number of instances.
- Tabs bind two listeners on the tablist rather than two per tab, and no
  longer stash handler references on the tab elements.
- `main` and `module` now point at a real ESM build (`dist/grain.esm.js`)
  rather than an IIFE. The `<script>` builds at `dist/grain.js` and
  `dist/grain.min.js` are unchanged, and are now ~200 bytes smaller because
  they no longer carry esbuild's CommonJS interop helpers.
- The light palette is declared once and shared by `:root` and
  `[data-theme="light"]`, removing 817 bytes of duplicated declarations.
- Repetitive selectors in `button.css`, `form.css`, `dropdown.css`, and
  `card.css` were rewritten with CSS nesting. Lightning CSS flattens this for
  the supported browsers, so the shipped output is byte-for-byte the same.
- The version is read from `package.json` at build time instead of being
  duplicated in the `Makefile`.

### Added

- TypeScript definitions at `dist/grain.d.ts`, wired up through `exports`.
- A test suite: 62 tests on Node's built-in runner, covering the four
  components, theme-token drift, and SSR safety.
- ESLint, Prettier, and Stylelint configuration.
- A CI workflow running lint, tests, build, size budget, and package
  verification on pull requests and on Node 18, 20, and 22.
- `npm run size`, which reports gzip and brotli sizes and fails when a
  distributable exceeds its budget.
- `npm run verify`, which checks that every `package.json` entry point
  resolves and that the public API is present.
- `CONTRIBUTING.md`, issue templates, and a pull request template.
- npm provenance attestation on publish, and a guard that refuses to publish
  when the git tag and `package.json` version disagree.

### Removed

- `.npmignore`, which was dead configuration — `package.json`'s `files` field
  takes precedence and the two contradicted each other.

## 0.1.0 - 2026-04-02

- Initial release of Grain, a semantic-first CSS and Web Components UI library.
- Shipped base design tokens, reset styles, dark mode, and utility classes.
- Shipped semantic components for buttons, forms, cards, badges, tables, alerts,
  dialogs, navigation, tabs, tooltips, progress, spinners, avatars, and dropdowns.
- Added custom elements for tabs, toast notifications, dialogs, and dropdown menus.
- Added a multi-page docs site covering getting started, components, and theming.
- Added npm packaging, build tooling, CI publishing workflow, and README docs.
