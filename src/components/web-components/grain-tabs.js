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
    requestAnimationFrame(() => this._init());
  }

  _init() {
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
      if (!panel) return;
      const tabId = tab.id || `${prefix}-tab-${index + 1}`;
      const panelId = panel.id || `${prefix}-panel-${index + 1}`;

      tab.id = tabId;
      panel.id = panelId;
      tab.setAttribute("aria-controls", panelId);
      panel.setAttribute("aria-labelledby", tabId);
      panel.tabIndex = 0;

      const onClick = () => this.select(index, true);
      const onKeydown = (event) => this._onKeydown(event, index);
      tab.addEventListener("click", onClick);
      tab.addEventListener("keydown", onKeydown);
      tab._grainClick = onClick;
      tab._grainKeydown = onKeydown;
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

  disconnectedCallback() {
    this._tabs?.forEach((tab) => {
      tab.removeEventListener("click", tab._grainClick);
      tab.removeEventListener("keydown", tab._grainKeydown);
    });
    this._mounted = false;
  }

  _onKeydown(event, index) {
    const isVertical =
      this.querySelector('[role="tablist"]')?.getAttribute("aria-orientation") === "vertical";

    let nextIndex = index;
    if (event.key === "ArrowRight" || (isVertical && event.key === "ArrowDown")) {
      nextIndex = (index + 1) % this._tabs.length;
    } else if (event.key === "ArrowLeft" || (isVertical && event.key === "ArrowUp")) {
      nextIndex = (index - 1 + this._tabs.length) % this._tabs.length;
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
