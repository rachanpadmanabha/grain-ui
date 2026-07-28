import { define, GrainElement, whenParsed } from "../../internal/dom.js";

let sequence = 0;

export class GrainTabs extends GrainElement {
  connectedCallback() {
    if (this._mounted) {
      return;
    }

    this._mounted = true;
    // Initialising on the next frame would paint every panel first. whenParsed
    // runs synchronously whenever the children are already available, which is
    // the case for the documented deferred-script setup.
    this._cancelInit = whenParsed(this, () => this._init());
  }

  disconnectedCallback() {
    this._cancelInit?.();
    this._tablist?.removeEventListener("click", this._onClick);
    this._tablist?.removeEventListener("keydown", this._onKeydown);
    this._tabs = [];
    this._panels = [];
    this._mounted = false;
  }

  _init() {
    this._tablist = this.querySelector('[role="tablist"]') || this;
    this._tabs = Array.from(this.querySelectorAll('[role="tab"]'));
    this._panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));

    if (!this._tabs.length || !this._panels.length) {
      return;
    }

    if (!this.id) {
      sequence += 1;
      this.id = `grain-tabs-${sequence}`;
    }

    this._tabs.forEach((tab, index) => {
      const panel = this._panels[index];
      if (!panel) {
        return;
      }

      tab.id = tab.id || `${this.id}-tab-${index + 1}`;
      panel.id = panel.id || `${this.id}-panel-${index + 1}`;
      tab.setAttribute("aria-controls", panel.id);
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
    });

    // Two delegated listeners for the whole tablist, rather than two per tab.
    this._onClick = (event) => {
      const index = this._indexOf(event.target);
      if (index !== -1) {
        this.select(index, true);
      }
    };

    this._onKeydown = (event) => {
      const index = this._indexOf(event.target);
      if (index !== -1) {
        this._handleKey(event, index);
      }
    };

    this._tablist.addEventListener("click", this._onClick);
    this._tablist.addEventListener("keydown", this._onKeydown);

    const selected = this._tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true"
    );

    this.select(Math.max(0, selected), false);
    this.setAttribute("data-grain-ready", "");
  }

  _indexOf(target) {
    const tab = target instanceof Element ? target.closest('[role="tab"]') : null;
    return tab ? this._tabs.indexOf(tab) : -1;
  }

  get selectedIndex() {
    return this._tabs?.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true"
    );
  }

  select(index, moveFocus = false) {
    if (!this._tabs?.length) {
      return;
    }

    this._tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.setAttribute("tabindex", selected ? "0" : "-1");
      if (selected && moveFocus) {
        tab.focus();
      }
    });

    this._panels.forEach((panel, panelIndex) => {
      panel.hidden = panelIndex !== index;
    });

    this.dispatchEvent(
      new CustomEvent("grain-change", {
        bubbles: true,
        detail: {
          index,
          tab: this._tabs[index],
          panel: this._panels[index]
        }
      })
    );
  }

  _handleKey(event, index) {
    const vertical = this._tablist?.getAttribute("aria-orientation") === "vertical";
    const count = this._tabs.length;
    let next = index;

    if (event.key === "ArrowRight" || (vertical && event.key === "ArrowDown")) {
      next = (index + 1) % count;
    } else if (event.key === "ArrowLeft" || (vertical && event.key === "ArrowUp")) {
      next = (index - 1 + count) % count;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = count - 1;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.select(index, true);
      return;
    } else {
      return;
    }

    event.preventDefault();
    this.select(next, true);
  }
}

export const registerGrainTabs = () => define("grain-tabs", GrainTabs);
