const itemSelector = [
  '[role="menu"] a[href]',
  '[role="menu"] button:not([disabled])',
  '[role="menu"] [role="menuitem"]:not([aria-disabled="true"])',
  "ul a[href]",
  "ul button:not([disabled])"
].join(", ");

export class GrainDropdown extends HTMLElement {
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
    this._summary.setAttribute("aria-expanded", String(this._details.open));

    this._onToggle = () => {
      this._summary.setAttribute("aria-expanded", String(this._details.open));
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

      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        items[Math.min(currentIndex + 1, items.length - 1)]?.focus();
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        items[Math.max(currentIndex - 1, 0)]?.focus();
      }

      if (event.key === "Home") {
        event.preventDefault();
        items[0]?.focus();
      }

      if (event.key === "End") {
        event.preventDefault();
        items[items.length - 1]?.focus();
      }

      if (event.key === "Tab" && items.length) {
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
    };

    this._onDocumentClick = (event) => {
      if (!this.contains(event.target)) {
        this.close(false);
      }
    };

    this._details.addEventListener("toggle", this._onToggle);
    this._summary.addEventListener("keydown", this._onSummaryKeydown);
    this._menu.addEventListener("keydown", this._onMenuKeydown);
    document.addEventListener("click", this._onDocumentClick);
  }

  disconnectedCallback() {
    this._details?.removeEventListener("toggle", this._onToggle);
    this._summary?.removeEventListener("keydown", this._onSummaryKeydown);
    this._menu?.removeEventListener("keydown", this._onMenuKeydown);
    document.removeEventListener("click", this._onDocumentClick);
  }

  _items() {
    return Array.from(this.querySelectorAll(itemSelector));
  }

  open(focusIndex = 0) {
    if (!this._details) {
      return;
    }

    this._details.open = true;
    this._summary.setAttribute("aria-expanded", "true");
    const items = this._items();
    requestAnimationFrame(() => items[focusIndex]?.focus());
  }

  close(focusSummary = true) {
    if (!this._details) {
      return;
    }

    this._details.open = false;
    this._summary.setAttribute("aria-expanded", "false");
    if (focusSummary) {
      this._summary.focus();
    }
  }
}

export const registerGrainDropdown = () => {
  if (!customElements.get("grain-dropdown")) {
    customElements.define("grain-dropdown", GrainDropdown);
  }
};
