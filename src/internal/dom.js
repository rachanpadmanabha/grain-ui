/**
 * Shared plumbing for Grain's custom elements.
 *
 * Every helper here exists to keep per-instance work off the document. A page
 * with fifty dropdowns should install one document listener, not fifty.
 */

/**
 * Base class for every Grain element.
 *
 * Server renderers evaluate module bodies with no DOM present, and
 * `class X extends HTMLElement` throws right there — before any guard inside
 * the class could run. Falling back to an inert class keeps `import` safe
 * during SSR; `define` separately declines to register anything.
 */
export const GrainElement =
  typeof HTMLElement === "undefined" ? class {} : HTMLElement;

/** Registers a custom element, tolerating repeat calls and non-browser hosts. */
export const define = (name, ctor) => {
  if (typeof customElements === "undefined") {
    return;
  }

  if (!customElements.get(name)) {
    customElements.define(name, ctor);
  }
};

/**
 * Invokes `callback` once the element's light-DOM children exist.
 *
 * A custom element upgrades as soon as its start tag is parsed, so a
 * synchronous `connectedCallback` can observe an empty subtree when the
 * defining script is not deferred. Waiting a frame would fix that but paints
 * the un-initialised markup first; waiting for `DOMContentLoaded` does not.
 *
 * Returns a cancel function so a disconnect can abort a pending callback.
 */
export const whenParsed = (element, callback) => {
  const ready = element.childElementCount > 0 || document.readyState !== "loading";

  if (ready) {
    callback();
    return () => {};
  }

  const onReady = () => {
    document.removeEventListener("DOMContentLoaded", onReady);
    if (element.isConnected) {
      callback();
    }
  };

  document.addEventListener("DOMContentLoaded", onReady);
  return () => document.removeEventListener("DOMContentLoaded", onReady);
};

/**
 * Installs a document listener the first time it is needed and keeps it for
 * the page's lifetime.
 *
 * Grain's delegated handlers are cheap no-ops when nothing is registered, so
 * holding one listener costs less than the add/remove churn of tracking how
 * many instances are currently connected.
 */
const installed = new Set();

export const delegate = (key, type, handler, options) => {
  if (installed.has(key)) {
    return;
  }

  installed.add(key);
  document.addEventListener(type, handler, options);
};

/** Narrows an event target to an Element, which `closest` requires. */
export const asElement = (value) => (value instanceof Element ? value : null);
