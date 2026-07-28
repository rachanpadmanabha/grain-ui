import { asElement, define, delegate, GrainElement } from "../../internal/dom.js";

let sequence = 0;

/**
 * Opens whichever modal a `[data-modal="<id>"]` trigger points at.
 *
 * One listener serves every modal on the page: a single `closest` call finds
 * the trigger, then an id lookup finds the target. Cost does not grow with the
 * number of modals.
 */
const onDocumentClick = (event) => {
  const target = asElement(event.target);
  const trigger = target?.closest("[data-modal]");
  if (!trigger) {
    return;
  }

  const modal = document.getElementById(trigger.getAttribute("data-modal"));
  if (!(modal instanceof GrainModal)) {
    return;
  }

  trigger.setAttribute("aria-haspopup", "dialog");
  modal.open();
};

export class GrainModal extends GrainElement {
  connectedCallback() {
    if (this._mounted) {
      return;
    }

    this._mounted = true;
    this._dialog = this.querySelector("dialog");

    if (!this._dialog) {
      return;
    }

    if (!this.id) {
      sequence += 1;
      this.id = `grain-modal-${sequence}`;
    }

    this._closeButtons = Array.from(this.querySelectorAll("[data-close]"));

    this._onCloseClick = () => this.close();

    // Dismiss when the backdrop, rather than the dialog's content, is clicked.
    this._onDialogClick = (event) => {
      if (event.target === this._dialog) {
        this.close();
      }
    };

    // The source of truth for "the dialog closed". Escape and the dialog's own
    // form[method=dialog] submits bypass close() entirely, so listening to the
    // native event is the only way grain-close fires for every close path.
    this._onDialogClose = () => {
      this.dispatchEvent(new CustomEvent("grain-close", { bubbles: true }));
    };

    this._closeButtons.forEach((button) => {
      button.addEventListener("click", this._onCloseClick);
    });

    this._dialog.addEventListener("click", this._onDialogClick);
    this._dialog.addEventListener("close", this._onDialogClose);

    delegate("grain-modal", "click", onDocumentClick);
  }

  disconnectedCallback() {
    this._closeButtons?.forEach((button) =>
      button.removeEventListener("click", this._onCloseClick)
    );
    this._dialog?.removeEventListener("click", this._onDialogClick);
    this._dialog?.removeEventListener("close", this._onDialogClose);
    this._mounted = false;
  }

  /**
   * Reads the `open` attribute rather than the `open` property: `showModal()`
   * reflects to the attribute, so this stays accurate on the fallback path and
   * outside a full `HTMLDialogElement` implementation.
   */
  get isOpen() {
    return Boolean(this._dialog?.hasAttribute("open"));
  }

  open() {
    if (!this._dialog || this.isOpen) {
      return;
    }

    if (typeof this._dialog.showModal === "function") {
      this._dialog.showModal();
    } else {
      this._dialog.setAttribute("open", "");
    }

    this.dispatchEvent(new CustomEvent("grain-open", { bubbles: true }));
  }

  close() {
    if (!this._dialog || !this.isOpen) {
      return;
    }

    if (typeof this._dialog.close === "function") {
      this._dialog.close();
      return;
    }

    this._dialog.removeAttribute("open");
    this._onDialogClose();
  }
}

export const registerGrainModal = () => define("grain-modal", GrainModal);
