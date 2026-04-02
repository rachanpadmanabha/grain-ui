# Grain

Ultra-lightweight semantic HTML/CSS/JS UI library. No dependencies, no build step.

Grain makes semantic HTML the API, CSS custom properties the theme system, and
Web Components the enhancement layer. Drop in one CSS file and one JS file to
get accessible, themeable UI primitives that work in plain HTML and framework apps.

## Features

- Ultra-lightweight: all styles and dynamic components ship in two distributable files.
- Zero runtime dependencies: no framework, no CSS preprocessor, no utility compiler.
- Semantic-first: native elements are the component surface area, not class names.
- Accessible by default: variants use `data-*` and `aria-*`, with keyboard-first interactions.
- Dark mode included: honors `prefers-color-scheme` and supports explicit theme overrides.
- Fully themeable: override tokens in `src/tokens.css` or in your app's `:root`.
- Works anywhere: use it from a CDN, npm, or inside React, Vue, Svelte, Astro, and more.

## Quick Start

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/@rachanpadmanabha/grain-ui/dist/grain.min.css">
<script src="https://unpkg.com/@rachanpadmanabha/grain-ui/dist/grain.min.js" defer></script>
```

### npm

```bash
npm install @rachanpadmanabha/grain-ui
```

```js
import "@rachanpadmanabha/grain-ui/css";
import "@rachanpadmanabha/grain-ui";
```

## Theming

The token file is the public theming contract. Override a few variables in `:root`
to re-skin the whole library:

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

## Component Reference

| Component | HTML usage | Variants / attributes |
| --- | --- | --- |
| Button | `<button>` / `<a role="button">` | `data-variant`, `data-size`, `aria-busy` |
| Form controls | `<input>`, `<textarea>`, `<select>`, `<fieldset>` | `aria-invalid`, `disabled`, `role="group"` |
| Card | `<article>` / `[role="article"]` | `tabindex`, `data-card` |
| Badge | `<mark>` / `[data-badge]` | `success`, `danger`, `warning`, `info`, `neutral`, `outline` |
| Alert | `[role="alert"]`, `[role="status"]`, `[role="note"]` | role-based tone |
| Table | `<table>` / `[data-table-wrap]` | `data-density`, `aria-selected` |
| Modal | `<dialog>` inside `<grain-modal>` | `data-modal`, `data-close` |
| Tabs | `<grain-tabs>` with `[role="tab"]` | keyboard arrows, `aria-selected` |
| Tooltip | `[data-tooltip]` | `data-side="bottom"` |
| Progress | `<progress>` | `data-tone` |
| Spinner | `[data-spinner]` | `data-size` |
| Avatar | `[data-avatar]` on `<img>` / `<span>` | `data-size` |
| Dropdown | `<details data-dropdown>` or `<grain-dropdown>` | keyboard nav, `role="menu"` |
| Nav | `<nav>` | `aria-current`, `aria-orientation`, `data-layout` |

## Browser Support

Grain targets modern evergreen browsers:

- Chrome / Edge 111+
- Firefox 113+
- Safari 16.4+

The library relies on CSS custom properties, the `<dialog>` element, and Custom Elements.
Internet Explorer is not supported.

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
