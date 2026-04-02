export class GrainModal extends HTMLElement {
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
      this.id = `grain-modal-${Math.random().toString(36).slice(2, 8)}`;
    }

    this._triggers = Array.from(document.querySelectorAll(`[data-modal="${this.id}"]`));
    this._closeButtons = Array.from(this.querySelectorAll("[data-close]"));

    this._open = () => this.open();
    this._close = () => this.close();
    this._onDialogClick = (event) => {
      if (event.target === this._dialog) {
        this.close();
      }
    };

    this._triggers.forEach((trigger) => {
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.addEventListener("click", this._open);
    });

    this._closeButtons.forEach((button) => {
      button.addEventListener("click", this._close);
    });

    this._dialog.addEventListener("click", this._onDialogClick);
  }

  disconnectedCallback() {
    this._triggers?.forEach((trigger) => trigger.removeEventListener("click", this._open));
    this._closeButtons?.forEach((button) => button.removeEventListener("click", this._close));
    this._dialog?.removeEventListener("click", this._onDialogClick);
  }

  open() {
    if (!this._dialog) {
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
    if (!this._dialog) {
      return;
    }

    if (typeof this._dialog.close === "function") {
      this._dialog.close();
    } else {
      this._dialog.removeAttribute("open");
    }

    this.dispatchEvent(new CustomEvent("grain-close", { bubbles: true }));
  }
}

export const registerGrainModal = () => {
  if (!customElements.get("grain-modal")) {
    customElements.define("grain-modal", GrainModal);
  }
};
