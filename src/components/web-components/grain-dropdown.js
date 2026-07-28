import { asElement, define, delegate, GrainElement } from "../../internal/dom.js";

const itemSelector = [
  '[role="menu"] a[href]',
  '[role="menu"] button:not([disabled])',
  '[role="menu"] [role="menuitem"]:not([aria-disabled="true"])',
  "ul a[href]",
  "ul button:not([disabled])"
].join(", ");

/**
 * Only dropdowns that are currently open need outside-click handling, so the
 * shared listener iterates that set instead of every instance on the page.
 * When nothing is open it does no work at all.
 */
const openDropdowns = new Set();

const onDocumentClick = (event) => {
  if (openDropdowns.size === 0) {
    return;
  }

  const target = asElement(event.target);
  for (const dropdown of [...openDropdowns]) {
    if (!target || !dropdown.contains(target)) {
      dropdown.close(false);
    }
  }
};

export class GrainDropdown extends GrainElement {
  connectedCallback() {
    if (this._mounted) {
      return;
    }

    this._mounted = true;
    this._details = this.querySelector("details");
    this._summary = this._details?.querySelector("summary");
    this._menu = this._details?.querySelector('[role="menu"], ul, nav');

    if (!this._details || !this._summary || !this._menu) {
      return;
    }

    if (!this._menu.hasAttribute("role")) {
      this._menu.setAttribute("role", "menu");
    }

    this._summary.setAttribute("aria-haspopup", "menu");
    this._syncExpanded();

    this._onToggle = () => {
      this._syncExpanded();
      if (this.isOpen) {
        openDropdowns.add(this);
      } else {
        openDropdowns.delete(this);
      }
    };

    this._onSummaryKeydown = (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.open(0);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        this.open(this._items().length - 1);
      }
    };

    this._onMenuKeydown = (event) => {
      const items = this._items();
      const currentIndex = items.indexOf(document.activeElement);

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          this.close();
          return;
        case "ArrowDown":
          event.preventDefault();
          items[Math.min(currentIndex + 1, items.length - 1)]?.focus();
          return;
        case "ArrowUp":
          event.preventDefault();
          items[Math.max(currentIndex - 1, 0)]?.focus();
          return;
        case "Home":
          event.preventDefault();
          items[0]?.focus();
          return;
        case "End":
          event.preventDefault();
          items[items.length - 1]?.focus();
          return;
        case "Tab":
          this._onTab(event, items);
          return;
        default:
      }
    };

    this._details.addEventListener("toggle", this._onToggle);
    this._summary.addEventListener("keydown", this._onSummaryKeydown);
    this._menu.addEventListener("keydown", this._onMenuKeydown);

    if (this.isOpen) {
      openDropdowns.add(this);
    }

    delegate("grain-dropdown", "click", onDocumentClick);
  }

  disconnectedCallback() {
    this._details?.removeEventListener("toggle", this._onToggle);
    this._summary?.removeEventListener("keydown", this._onSummaryKeydown);
    this._menu?.removeEventListener("keydown", this._onMenuKeydown);
    openDropdowns.delete(this);
    this._mounted = false;
  }

  /** Keeps Tab from escaping the menu without trapping Shift+Tab on the summary. */
  _onTab(event, items) {
    if (!items.length) {
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      this._summary.focus();
    }
  }

  /** Coerced rather than read raw: `aria-expanded="undefined"` is invalid ARIA. */
  get isOpen() {
    return Boolean(this._details?.open);
  }

  _syncExpanded() {
    this._summary.setAttribute("aria-expanded", String(this.isOpen));
  }

  _items() {
    return Array.from(this.querySelectorAll(itemSelector));
  }

  open(focusIndex = 0) {
    if (!this._details || this.isOpen) {
      return;
    }

    this._details.open = true;
    this._syncExpanded();
    openDropdowns.add(this);

    const items = this._items();
    const focusItem = () => items[focusIndex]?.focus();

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(focusItem);
    } else {
      focusItem();
    }
  }

  close(focusSummary = true) {
    if (!this._details || !this.isOpen) {
      return;
    }

    this._details.open = false;
    this._syncExpanded();
    openDropdowns.delete(this);

    if (focusSummary) {
      this._summary.focus();
    }
  }
}

export const registerGrainDropdown = () => define("grain-dropdown", GrainDropdown);
