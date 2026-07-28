import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { installDOM, keydown, click, render } from "./helpers/dom.js";

installDOM();
const { registerGrainTabs } =
  await import("../src/components/web-components/grain-tabs.js");
registerGrainTabs();

const markup = `
  <grain-tabs>
    <div role="tablist">
      <button role="tab">One</button>
      <button role="tab">Two</button>
      <button role="tab">Three</button>
    </div>
    <div role="tabpanel">First</div>
    <div role="tabpanel">Second</div>
    <div role="tabpanel">Third</div>
  </grain-tabs>
`;

const setup = () => {
  const tabs = render(markup);
  return {
    tabs,
    buttons: [...tabs.querySelectorAll('[role="tab"]')],
    panels: [...tabs.querySelectorAll('[role="tabpanel"]')]
  };
};

describe("grain-tabs", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("selects the first tab synchronously on connect", () => {
    const { buttons, panels } = setup();

    // Regression guard: initialisation used to be deferred to
    // requestAnimationFrame, which painted every panel for one frame.
    assert.equal(buttons[0].getAttribute("aria-selected"), "true");
    assert.equal(panels[0].hidden, false);
    assert.equal(panels[1].hidden, true);
    assert.equal(panels[2].hidden, true);
  });

  it("wires aria-controls and aria-labelledby both ways", () => {
    const { buttons, panels } = setup();

    buttons.forEach((button, index) => {
      assert.equal(button.getAttribute("aria-controls"), panels[index].id);
      assert.equal(panels[index].getAttribute("aria-labelledby"), button.id);
    });
  });

  it("honours a pre-selected tab in the markup", () => {
    document.body.innerHTML = markup.replace(
      '<button role="tab">Two</button>',
      '<button role="tab" aria-selected="true">Two</button>'
    );
    const panels = [...document.querySelectorAll('[role="tabpanel"]')];

    assert.equal(panels[1].hidden, false);
    assert.equal(panels[0].hidden, true);
  });

  it("activates a tab on click", () => {
    const { buttons, panels } = setup();

    click(buttons[2]);

    assert.equal(buttons[2].getAttribute("aria-selected"), "true");
    assert.equal(buttons[0].getAttribute("aria-selected"), "false");
    assert.equal(panels[2].hidden, false);
  });

  it("keeps a single tab stop via roving tabindex", () => {
    const { buttons } = setup();

    click(buttons[1]);

    assert.equal(buttons[1].getAttribute("tabindex"), "0");
    assert.equal(buttons[0].getAttribute("tabindex"), "-1");
    assert.equal(buttons[2].getAttribute("tabindex"), "-1");
  });

  it("moves between tabs with arrow keys and wraps around", () => {
    const { buttons } = setup();

    keydown(buttons[0], "ArrowRight");
    assert.equal(buttons[1].getAttribute("aria-selected"), "true");

    keydown(buttons[1], "ArrowRight");
    keydown(buttons[2], "ArrowRight");
    assert.equal(
      buttons[0].getAttribute("aria-selected"),
      "true",
      "ArrowRight past the last tab should wrap to the first"
    );

    keydown(buttons[0], "ArrowLeft");
    assert.equal(
      buttons[2].getAttribute("aria-selected"),
      "true",
      "ArrowLeft before the first tab should wrap to the last"
    );
  });

  it("jumps to the ends with Home and End", () => {
    const { buttons } = setup();

    keydown(buttons[0], "End");
    assert.equal(buttons[2].getAttribute("aria-selected"), "true");

    keydown(buttons[2], "Home");
    assert.equal(buttons[0].getAttribute("aria-selected"), "true");
  });

  it("ignores arrow keys it does not handle", () => {
    const { buttons } = setup();

    const event = keydown(buttons[0], "ArrowDown");

    assert.equal(
      buttons[0].getAttribute("aria-selected"),
      "true",
      "horizontal tablists should not respond to ArrowDown"
    );
    assert.equal(event.defaultPrevented, false);
  });

  it("responds to vertical arrows when the tablist says so", () => {
    document.body.innerHTML = markup.replace(
      '<div role="tablist">',
      '<div role="tablist" aria-orientation="vertical">'
    );
    const buttons = [...document.querySelectorAll('[role="tab"]')];

    keydown(buttons[0], "ArrowDown");

    assert.equal(buttons[1].getAttribute("aria-selected"), "true");
  });

  it("emits grain-change with the new index", () => {
    const { tabs, buttons } = setup();
    const seen = [];
    tabs.addEventListener("grain-change", (event) => seen.push(event.detail.index));

    click(buttons[1]);

    assert.deepEqual(seen, [1]);
  });

  it("exposes the selected index", () => {
    const { tabs, buttons } = setup();

    click(buttons[2]);

    assert.equal(tabs.selectedIndex, 2);
  });

  it("does nothing without tabs or panels", () => {
    assert.doesNotThrow(() => render("<grain-tabs></grain-tabs>"));
  });

  it("detaches listeners on disconnect", () => {
    const { tabs, buttons } = setup();
    tabs.remove();

    click(buttons[2]);

    assert.equal(
      buttons[2].getAttribute("aria-selected"),
      "false",
      "a removed tablist should stop responding to clicks"
    );
  });
});
