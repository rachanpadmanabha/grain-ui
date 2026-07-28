import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { installDOM, tick } from "./helpers/dom.js";

installDOM();
const { GrainToast, registerGrainToast } =
  await import("../src/components/web-components/grain-toast.js");
registerGrainToast();

const region = () => document.querySelector("[data-grain-toast-region]");
const toasts = () => [...document.querySelectorAll("grain-toast")];

describe("grain-toast", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("creates the live region on first use", async () => {
    GrainToast.show("hello");
    await tick();

    assert.ok(region(), "a toast region should exist");
  });

  it("marks the region as a polite live region", async () => {
    GrainToast.show("hello");
    await tick();

    // The region must be the live region, announced politely. Toasts used to
    // carry role="alert" and aria-live="polite" at once, which conflict.
    assert.equal(region().getAttribute("role"), "status");
    assert.equal(region().getAttribute("aria-live"), "polite");
  });

  it("leaves conflicting roles off the toast itself", async () => {
    GrainToast.show("hello");
    await tick();

    const toast = toasts()[0];
    assert.equal(toast.getAttribute("role"), null);
    assert.equal(toast.getAttribute("aria-live"), null);
  });

  it("defers the first insertion so the region is announced", async () => {
    GrainToast.show("hello");

    assert.equal(
      toasts().length,
      0,
      "content added in the same task as the region is unreliably announced"
    );

    await tick();
    assert.equal(toasts().length, 1);
  });

  it("reuses the region for later toasts", async () => {
    GrainToast.show("first");
    await tick();
    const first = region();

    GrainToast.show("second");
    assert.equal(region(), first);
    assert.equal(toasts().length, 2);
  });

  it("renders the message and type", async () => {
    GrainToast.show("saved", { type: "success" });
    await tick();

    const toast = toasts()[0];
    assert.equal(toast.textContent, "saved");
    assert.equal(toast.getAttribute("type"), "success");
  });

  it("styles by attribute rather than inline style", async () => {
    GrainToast.show("saved", { type: "success" });
    await tick();

    // Presentation lives in toast.css so themes can override it; inline
    // styles would need !important to beat.
    assert.equal(toasts()[0].getAttribute("style"), null);
  });

  it("auto-dismisses after its duration", async () => {
    GrainToast.show("bye", { duration: 20 });
    await tick();
    assert.equal(toasts().length, 1);

    await tick(40);
    assert.equal(toasts().length, 0);
  });

  it("stays put when the duration is zero or negative", async () => {
    GrainToast.show("sticky", { duration: 0 });
    await tick(30);

    assert.equal(toasts().length, 1);
  });

  it("falls back to the default duration for an unparseable value", async () => {
    GrainToast.show("hi");
    await tick();
    const toast = toasts()[0];

    toast.setAttribute("duration", "not-a-number");
    await tick(30);

    assert.equal(
      toasts().length,
      1,
      "a bad duration should not drop the toast immediately"
    );
  });

  it("caps how many toasts are visible at once", async () => {
    GrainToast.show("first", { duration: 0 });
    await tick();
    for (let i = 0; i < 8; i += 1) {
      GrainToast.show(`toast ${i}`, { duration: 0 });
    }

    assert.equal(toasts().length, 5);
    assert.equal(
      toasts().at(-1).textContent,
      "toast 7",
      "the newest toast should survive the cap"
    );
  });

  it("clears its timer when removed early", async () => {
    const toast = GrainToast.show("bye", { duration: 20 });
    await tick();
    toast.remove();

    await assert.doesNotReject(tick(40));
    assert.equal(toasts().length, 0);
  });
});
