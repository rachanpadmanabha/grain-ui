import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { click, installDOM, keydown, render } from "./helpers/dom.js";

installDOM();
const { registerGrainDropdown } =
  await import("../src/components/web-components/grain-dropdown.js");
registerGrainDropdown();

const markup = `
  <grain-dropdown>
    <details>
      <summary>Menu</summary>
      <ul role="menu">
        <li><button>One</button></li>
        <li><button>Two</button></li>
        <li><button>Three</button></li>
      </ul>
    </details>
  </grain-dropdown>
`;

const setup = () => {
  const dropdown = render(markup);
  return {
    dropdown,
    details: dropdown.querySelector("details"),
    summary: dropdown.querySelector("summary"),
    menu: dropdown.querySelector('[role="menu"]'),
    items: [...dropdown.querySelectorAll("button")]
  };
};

describe("grain-dropdown", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("marks the summary as a menu trigger", () => {
    const { summary } = setup();

    assert.equal(summary.getAttribute("aria-haspopup"), "menu");
    assert.equal(summary.getAttribute("aria-expanded"), "false");
  });

  it("applies role=menu when the markup omits it", () => {
    const dropdown = render(
      markup
        .replace(' role="menu"', "")
        .replace("</grain-dropdown>", "</grain-dropdown>")
    );

    assert.equal(dropdown.querySelector("ul").getAttribute("role"), "menu");
  });

  it("tracks aria-expanded through open and close", () => {
    const { dropdown, summary, details } = setup();

    dropdown.open();
    assert.equal(details.open, true);
    assert.equal(summary.getAttribute("aria-expanded"), "true");

    dropdown.close();
    assert.equal(details.open, false);
    assert.equal(summary.getAttribute("aria-expanded"), "false");
  });

  it("syncs aria-expanded when the details toggles natively", () => {
    const { details, summary } = setup();

    details.open = true;
    details.dispatchEvent(new Event("toggle"));

    assert.equal(summary.getAttribute("aria-expanded"), "true");
  });

  it("opens on ArrowDown from the summary", () => {
    const { summary, details } = setup();

    keydown(summary, "ArrowDown");

    assert.equal(details.open, true);
  });

  it("opens on ArrowUp from the summary", () => {
    const { summary, details } = setup();

    keydown(summary, "ArrowUp");

    assert.equal(details.open, true);
  });

  it("closes on Escape from within the menu", () => {
    const { dropdown, details, items } = setup();
    dropdown.open();

    keydown(items[0], "Escape");

    assert.equal(details.open, false);
  });

  it("closes when a click lands outside", () => {
    const { dropdown, details } = setup();
    document.body.insertAdjacentHTML(
      "beforeend",
      '<button id="outside">x</button>'
    );
    dropdown.open();

    click(document.getElementById("outside"));

    assert.equal(details.open, false);
  });

  it("stays open when a click lands inside", () => {
    const { dropdown, details, items } = setup();
    dropdown.open();

    click(items[1]);

    assert.equal(details.open, true);
  });

  it("does no work on outside clicks while closed", () => {
    const { dropdown } = setup();
    document.body.insertAdjacentHTML(
      "beforeend",
      '<button id="outside">x</button>'
    );

    assert.doesNotThrow(() => click(document.getElementById("outside")));
    assert.equal(dropdown.isOpen, false);
  });

  it("stops tracking a dropdown once it is removed", () => {
    const { dropdown, details } = setup();
    document.body.insertAdjacentHTML(
      "beforeend",
      '<button id="outside">x</button>'
    );
    dropdown.open();
    dropdown.remove();

    // The shared listener must not retain detached instances.
    assert.doesNotThrow(() => click(document.getElementById("outside")));
    assert.equal(details.open, true, "a detached dropdown should be left alone");
  });

  it("ignores repeated open and close calls", () => {
    const { dropdown, details } = setup();

    dropdown.open();
    dropdown.open();
    assert.equal(details.open, true);

    dropdown.close();
    dropdown.close();
    assert.equal(details.open, false);
  });

  it("does nothing without a details element", () => {
    assert.doesNotThrow(() => {
      const dropdown = render("<grain-dropdown></grain-dropdown>");
      dropdown.open();
      dropdown.close();
    });
  });
});
