import { parseHTML } from "linkedom";

/**
 * Installs a linkedom document as the global DOM.
 *
 * Must run before any component module is imported: the element classes
 * evaluate `extends HTMLElement` at module scope, so they bind to whichever
 * global exists at import time. Test files therefore call this at top level
 * and then `await import(...)` the components.
 */
export const installDOM = () => {
  const win = parseHTML("<!doctype html><html><head></head><body></body></html>");

  const globals = [
    "document",
    "customElements",
    "HTMLElement",
    "Element",
    "Node",
    "Event",
    "CustomEvent",
    "DocumentFragment",
    "MutationObserver"
  ];

  for (const key of globals) {
    if (win[key] !== undefined) {
      globalThis[key] = win[key];
    }
  }

  globalThis.window = win;
  return win;
};

/** Replaces the body's markup and returns the first matching element. */
export const render = (html) => {
  document.body.innerHTML = html;
  return document.body.firstElementChild;
};

/** Dispatches a bubbling click, the way a real user interaction would. */
export const click = (element) => {
  element.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
};

/**
 * Dispatches a bubbling keydown carrying `key`.
 *
 * linkedom has no KeyboardEvent, and the components only read `key`,
 * `shiftKey`, and `preventDefault`, so a tagged Event is sufficient.
 */
export const keydown = (element, key, { shiftKey = false } = {}) => {
  const event = new Event("keydown", { bubbles: true, cancelable: true });
  event.key = key;
  event.shiftKey = shiftKey;
  element.dispatchEvent(event);
  return event;
};

/** Resolves after pending timer callbacks have run. */
export const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
