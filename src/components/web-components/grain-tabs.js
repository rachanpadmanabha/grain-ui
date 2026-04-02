const grainTabsId = (() => {
  let count = 0;
  return () => {
    count += 1;
    return `grain-tabs-${count}`;
  };
})();

export class GrainTabs extends HTMLElement {
  connectedCallback() {
    if (this._mounted) {
      return;
    }

    this._mounted = true;
    this._tabs = Array.from(this.querySelectorAll('[role="tab"]'));
    this._panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));

    if (!this._tabs.length || !this._panels.length) {
      return;
    }

    const prefix = this.id || grainTabsId();
    if (!this.id) {
      this.id = prefix;
    }

    this._tabs.forEach((tab, index) => {
      const panel = this._panels[index];
      const tabId = tab.id || `${prefix}-tab-${index + 1}`;
      const panelId = panel.id || `${prefix}-panel-${index + 1}`;

      tab.id = tabId;
      panel.id = panelId;
      tab.setAttribute("aria-controls", panelId);
      panel.setAttribute("aria-labelledby", tabId);
      panel.tabIndex = 0;

      tab.addEventListener("click", () => this.select(index, true));
      tab.addEventListener("keydown", (event) => this._onKeydown(event, index));
    });

    const selectedIndex = Math.max(
      0,
      this._tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true")
    );

    this.select(selectedIndex, false);
  }

  select(index, moveFocus = false) {
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

  _onKeydown(event, index) {
    const isVertical =
      this.querySelector('[role="tablist"]')?.getAttribute("aria-orientation") === "vertical";

    let nextIndex = index;
    if (event.key === "ArrowRight" || (isVertical && event.key === "ArrowDown")) {
      nextIndex = Math.min(index + 1, this._tabs.length - 1);
    } else if (event.key === "ArrowLeft" || (isVertical && event.key === "ArrowUp")) {
      nextIndex = Math.max(index - 1, 0);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = this._tabs.length - 1;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.select(index, true);
      return;
    } else {
      return;
    }

    event.preventDefault();
    this.select(nextIndex, true);
  }
}

export const registerGrainTabs = () => {
  if (!customElements.get("grain-tabs")) {
    customElements.define("grain-tabs", GrainTabs);
  }
};
