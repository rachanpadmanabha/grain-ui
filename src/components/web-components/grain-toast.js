import { define, GrainElement } from "../../internal/dom.js";

const DEFAULT_DURATION = 4000;
const MAX_VISIBLE = 5;

/**
 * Returns the shared toast stack, plus whether this call created it.
 *
 * Assistive technology only reliably announces content added to a live region
 * that was already in the document, so callers use the second return value to
 * defer the first insertion by a task.
 */
const ensureRegion = () => {
  const existing = document.querySelector("[data-grain-toast-region]");
  if (existing) {
    return [existing, false];
  }

  const region = document.createElement("div");
  region.setAttribute("data-grain-toast-region", "");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-atomic", "false");
  document.body.append(region);
  return [region, true];
};

export class GrainToast extends GrainElement {
  static get observedAttributes() {
    return ["duration"];
  }

  connectedCallback() {
    this._setTimer();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._setTimer();
    }
  }

  disconnectedCallback() {
    clearTimeout(this._timer);
  }

  _setTimer() {
    clearTimeout(this._timer);

    const raw = Number.parseInt(this.getAttribute("duration") ?? "", 10);
    const duration = Number.isNaN(raw) ? DEFAULT_DURATION : raw;

    // A non-positive duration pins the toast until it is removed by hand.
    if (duration > 0) {
      this._timer = setTimeout(() => this.remove(), duration);
    }
  }

  /**
   * Shows a toast in the shared region.
   *
   * @param {string} message
   * @param {{ type?: string, duration?: number }} [options]
   * @returns {GrainToast}
   */
  static show(message, { type = "default", duration = DEFAULT_DURATION } = {}) {
    const [region, isNew] = ensureRegion();

    while (region.children.length >= MAX_VISIBLE) {
      region.firstElementChild.remove();
    }

    const toast = document.createElement("grain-toast");
    toast.setAttribute("type", type);
    toast.setAttribute("duration", String(duration));
    toast.textContent = message;

    if (isNew) {
      setTimeout(() => region.append(toast), 0);
    } else {
      region.append(toast);
    }

    return toast;
  }
}

export const registerGrainToast = () => define("grain-toast", GrainToast);
