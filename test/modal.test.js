import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { click, installDOM, render } from "./helpers/dom.js";

installDOM();
const { registerGrainModal } =
  await import("../src/components/web-components/grain-modal.js");
registerGrainModal();

const markup = `
  <grain-modal id="demo">
    <dialog>
      <p>Body</p>
      <button data-close>Close</button>
    </dialog>
  </grain-modal>
`;

const setup = () => {
  const modal = render(markup);
  return { modal, dialog: modal.querySelector("dialog") };
};

describe("grain-modal", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("starts closed", () => {
    const { modal } = setup();
    assert.equal(modal.isOpen, false);
  });

  it("opens and closes through its own API", () => {
    const { modal } = setup();

    modal.open();
    assert.equal(modal.isOpen, true);

    modal.close();
    assert.equal(modal.isOpen, false);
  });

  it("emits grain-open when opened", () => {
    const { modal } = setup();
    let count = 0;
    modal.addEventListener("grain-open", () => (count += 1));

    modal.open();

    assert.equal(count, 1);
  });

  it("emits grain-close when the dialog closes itself", () => {
    const { modal, dialog } = setup();
    let count = 0;
    modal.addEventListener("grain-close", () => (count += 1));

    modal.open();
    // What Escape does in a real browser: the dialog closes natively and
    // fires `close` without any call to the component's close().
    dialog.dispatchEvent(new Event("close"));

    assert.equal(
      count,
      1,
      "grain-close must fire for close paths that bypass close()"
    );
  });

  it("emits grain-close exactly once per close", () => {
    const { modal } = setup();
    let count = 0;
    modal.addEventListener("grain-close", () => (count += 1));

    modal.open();
    modal.close();

    assert.equal(count, 1);
  });

  it("ignores repeated open and close calls", () => {
    const { modal } = setup();
    let opens = 0;
    let closes = 0;
    modal.addEventListener("grain-open", () => (opens += 1));
    modal.addEventListener("grain-close", () => (closes += 1));

    modal.open();
    modal.open();
    modal.close();
    modal.close();

    assert.equal(opens, 1);
    assert.equal(closes, 1);
  });

  it("closes when a [data-close] control is clicked", () => {
    const { modal } = setup();
    modal.open();

    click(modal.querySelector("[data-close]"));

    assert.equal(modal.isOpen, false);
  });

  it("opens from a [data-modal] trigger anywhere in the document", () => {
    const { modal } = setup();
    document.body.insertAdjacentHTML(
      "beforeend",
      '<button data-modal="demo">Open</button>'
    );

    click(document.querySelector("[data-modal]"));

    assert.equal(modal.isOpen, true);
  });

  it("marks the trigger with aria-haspopup", () => {
    setup();
    document.body.insertAdjacentHTML(
      "beforeend",
      '<button data-modal="demo">Open</button>'
    );
    const trigger = document.querySelector("[data-modal]");

    click(trigger);

    assert.equal(trigger.getAttribute("aria-haspopup"), "dialog");
  });

  it("opens from a nested element inside the trigger", () => {
    const { modal } = setup();
    document.body.insertAdjacentHTML(
      "beforeend",
      '<button data-modal="demo"><span id="label">Open</span></button>'
    );

    click(document.getElementById("label"));

    assert.equal(modal.isOpen, true);
  });

  it("ignores triggers pointing at a missing id", () => {
    const { modal } = setup();
    document.body.insertAdjacentHTML(
      "beforeend",
      '<button data-modal="nope">Open</button>'
    );

    click(document.querySelector("[data-modal]"));

    assert.equal(modal.isOpen, false);
  });

  it("survives clicks whose target is not an element", () => {
    setup();

    // event.target.closest() used to be called unguarded, which throws for
    // any non-Element target.
    assert.doesNotThrow(() => {
      document.dispatchEvent(new Event("click", { bubbles: true }));
    });
  });

  it("assigns an id when the markup omits one", () => {
    const modal = render("<grain-modal><dialog><p>Body</p></dialog></grain-modal>");
    assert.match(modal.id, /^grain-modal-\d+$/);
  });

  it("does nothing without a dialog", () => {
    assert.doesNotThrow(() => {
      const modal = render("<grain-modal></grain-modal>");
      modal.open();
      modal.close();
    });
  });
});
