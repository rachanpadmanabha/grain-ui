# Grain

Ultra-lightweight semantic HTML/CSS/JS UI library. No dependencies, no build
step.

Grain makes semantic HTML the API, CSS custom properties the theme system, and
Web Components the enhancement layer. Drop in one CSS file and one JS file to
get accessible, themeable UI primitives that work in plain HTML and framework
apps.

**4.8 KB of CSS and 2.6 KB of JavaScript, gzipped.** Both are enforced by a size
budget in CI.

## Features

- Ultra-lightweight: all styles and dynamic components ship in two files.
- Zero runtime dependencies: no framework, no CSS preprocessor, no utility
  compiler.
- Semantic-first: native elements are the component surface area, not class
  names.
- Accessible by default: variants use `data-*` and `aria-*`, with keyboard-first
  interactions.
- Dark mode included: honors `prefers-color-scheme` and supports explicit theme
  overrides.
- Fully themeable: override tokens in `src/tokens.css` or in your app's `:root`.
- SSR-safe: importing the package never touches the DOM at module scope.
- Typed: TypeScript definitions ship with the package.

## Quick Start

### CDN

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@rachanpadmanabha/grain-ui/dist/grain.min.css"
/>
<script
  src="https://unpkg.com/@rachanpadmanabha/grain-ui/dist/grain.min.js"
  defer
></script>
```

Components register themselves. The classes are also available on
`window.GrainUI` if you need them:

```js
GrainUI.GrainToast.show("Saved", { type: "success" });
```

### npm

```bash
npm install @rachanpadmanabha/grain-ui
```

```js
import "@rachanpadmanabha/grain-ui/css";
import { GrainToast } from "@rachanpadmanabha/grain-ui";

GrainToast.show("Saved", { type: "success" });
```

## Theming

The token file is the public theming contract. Override a few variables in
`:root` to re-skin the whole library:

```css
:root {
  --gr-hue: 168;
  --gr-font: "IBM Plex Sans", system-ui, sans-serif;
  --gr-radius: 10px;
  --gr-accent: hsl(168 76% 34%);
  --gr-accent-hover: hsl(168 76% 28%);
}
```

You can also scope themes to a subtree:

```css
[data-theme-demo] {
  --gr-hue: 32;
  --gr-bg: hsl(40 40% 98%);
  --gr-surface: hsl(40 30% 96%);
}
```

Set `data-theme="light"` or `data-theme="dark"` on any element to pin a palette
regardless of the OS preference.

## Component Reference

| Component     | HTML usage                                                      | Variants / attributes                                        |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------------ |
| Button        | `<button>` / `<a role="button">`                                | `data-variant`, `data-size`, `aria-busy`                     |
| Form controls | `<input>`, `<textarea>`, `<select>`, `<fieldset>`               | `aria-invalid`, `disabled`, `role="group"`                   |
| Card          | `<article>` / `[role="article"]`                                | `tabindex`, `data-card`                                      |
| Badge         | `<mark>` / `[data-badge]`                                       | `success`, `danger`, `warning`, `info`, `neutral`, `outline` |
| Alert         | `<aside role="alert">`, `"status"`, `"note"`, `"complementary"` | role-based tone                                              |
| Table         | `<table>` / `[data-table-wrap]`                                 | `data-density`, `aria-selected`                              |
| Modal         | `<dialog>` inside `<grain-modal>`                               | `data-modal`, `data-close`                                   |
| Tabs          | `<grain-tabs>` with `[role="tab"]`                              | keyboard arrows, `aria-selected`                             |
| Toast         | `GrainToast.show()`                                             | `type`, `duration`                                           |
| Tooltip       | `[data-tooltip]`                                                | `data-side="bottom"`                                         |
| Progress      | `<progress>`                                                    | `data-tone`                                                  |
| Spinner       | `[data-spinner]`                                                | `data-size`                                                  |
| Avatar        | `[data-avatar]` on `<img>` / `<span>`                           | `data-size`                                                  |
| Dropdown      | `<details data-dropdown>` or `<grain-dropdown>`                 | keyboard nav, `role="menu"`                                  |
| Nav           | `<nav>`                                                         | `aria-current`, `aria-orientation`, `data-layout`            |

## JavaScript API

Four custom elements register automatically. Each also exposes an imperative
interface.

```js
// Toasts
GrainToast.show("Saved", { type: "success", duration: 4000 });

// Modals — grain-open and grain-close fire for every open and close path,
// including Escape.
const modal = document.querySelector("grain-modal");
modal.open();
modal.addEventListener("grain-close", () => console.log(modal.isOpen)); // false

// Tabs
const tabs = document.querySelector("grain-tabs");
tabs.select(2);
tabs.addEventListener("grain-change", (e) => console.log(e.detail.index));

// Dropdowns
document.querySelector("grain-dropdown").open(0); // opens, focusing item 0
```

## Package Entry Points

| Specifier                            | What you get                      |
| ------------------------------------ | --------------------------------- |
| `@rachanpadmanabha/grain-ui`         | ESM bundle, auto-registers, typed |
| `@rachanpadmanabha/grain-ui/css`     | Full stylesheet                   |
| `@rachanpadmanabha/grain-ui/min.css` | Minified stylesheet               |
| `@rachanpadmanabha/grain-ui/iife`    | Browser global build              |
| `@rachanpadmanabha/grain-ui/min`     | Minified browser global build     |

## Browser Support

Grain targets modern evergreen browsers:

- Chrome / Edge 111+
- Firefox 113+
- Safari 16.4+

Targets live in the `browserslist` field of `package.json` and drive the CSS
build directly. The library relies on CSS custom properties, the `<dialog>`
element, and Custom Elements. Internet Explorer is not supported.

Source CSS is authored with nesting, which Lightning CSS flattens for these
targets at build time. Consume `dist/` unless your own toolchain handles
nesting.

## Docs

Run the local docs site with:

```bash
npm install
npm run dev
```

The docs source lives in [`docs/`](./docs), with entry pages:

- [`docs/index.html`](./docs/index.html)
- [`docs/getting-started.html`](./docs/getting-started.html)
- [`docs/components.html`](./docs/components.html)
- [`docs/theming.html`](./docs/theming.html)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for project layout, design principles,
and the checks a change needs to pass. In short: `npm run check`.

## License

[MIT](./LICENSE)
