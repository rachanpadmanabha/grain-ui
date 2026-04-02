const toastTheme = (type) => {
  switch (type) {
    case "error":
    case "danger":
      return {
        background: "var(--gr-danger-light)",
        border: "var(--gr-danger)",
        color: "var(--gr-danger)"
      };
    case "success":
      return {
        background: "var(--gr-success-light)",
        border: "var(--gr-success)",
        color: "var(--gr-success)"
      };
    case "info":
      return {
        background: "var(--gr-info-light)",
        border: "var(--gr-info)",
        color: "var(--gr-info)"
      };
    default:
      return {
        background: "var(--gr-text)",
        border: "transparent",
        color: "var(--gr-bg)"
      };
  }
};

const ensureToastRegion = () => {
  let region = document.querySelector("[data-grain-toast-region]");
  if (region) {
    return region;
  }

  region = document.createElement("div");
  region.setAttribute("data-grain-toast-region", "");
  region.style.cssText = [
    "position: fixed",
    "right: 1.5rem",
    "bottom: 1.5rem",
    "z-index: 9999",
    "display: grid",
    "gap: 0.75rem",
    "max-width: min(22rem, calc(100vw - 2rem))",
    "pointer-events: none"
  ].join("; ");
  document.body.append(region);
  return region;
};

export class GrainToast extends HTMLElement {
  static get observedAttributes() {
    return ["type", "duration"];
  }

  connectedCallback() {
    this.setAttribute("role", "alert");
    this.setAttribute("aria-live", "polite");
    this.style.pointerEvents = "auto";
    this.style.padding = "var(--gr-space-3) var(--gr-space-5)";
    this.style.borderRadius = "var(--gr-radius)";
    this.style.border = "1px solid transparent";
    this.style.boxShadow = "var(--gr-shadow-lg)";
    this.style.fontSize = "var(--gr-text-sm)";
    this.style.fontFamily = "var(--gr-font)";
    this.style.lineHeight = "1.5";
    this.style.maxWidth = "100%";
    this.style.background = "var(--gr-text)";
    this.style.color = "var(--gr-bg)";
    this._applyType();
    this._setTimer();

    if (
      !this._animated &&
      this.animate &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      this._animated = true;
      const dur =
        parseInt(getComputedStyle(this).getPropertyValue("--gr-duration")) ||
        200;
      this.animate(
        [
          { opacity: 0, transform: "translateY(0.75rem)" },
          { opacity: 1, transform: "translateY(0)" }
        ],
        {
          duration: dur,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both"
        }
      );
    }
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }

    this._applyType();
    this._setTimer();
  }

  disconnectedCallback() {
    clearTimeout(this._timer);
  }

  _applyType() {
    const { background, border, color } = toastTheme(this.getAttribute("type"));
    this.style.background = background;
    this.style.borderColor = border;
    this.style.color = color;
  }

  _setTimer() {
    clearTimeout(this._timer);
    const duration = Number.parseInt(this.getAttribute("duration") || "4000", 10);
    if (duration > 0) {
      this._timer = window.setTimeout(() => this.remove(), duration);
    }
  }

  static show(message, { type = "default", duration = 4000 } = {}) {
    const region = ensureToastRegion();
    const MAX_TOASTS = 5;
    while (region.children.length >= MAX_TOASTS) {
      region.firstElementChild.remove();
    }
    const el = document.createElement("grain-toast");
    el.setAttribute("type", type);
    el.setAttribute("duration", String(duration));
    el.textContent = message;
    region.appendChild(el);
    return el;
  }
}

export const registerGrainToast = () => {
  if (!customElements.get("grain-toast")) {
    customElements.define("grain-toast", GrainToast);
  }
  window.GrainToast = GrainToast;
};
