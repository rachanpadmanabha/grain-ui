import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * No DOM is installed in this file, on purpose.
 *
 * Server renderers evaluate module bodies with no `HTMLElement` in scope.
 * Importing Grain there must not throw, or any SSR framework that touches the
 * package crashes during render.
 */

describe("server-side rendering", () => {
  it("has no DOM available", () => {
    assert.equal(typeof HTMLElement, "undefined");
    assert.equal(typeof document, "undefined");
  });

  it("imports without a DOM", async () => {
    await assert.doesNotReject(() => import("../src/index.js"));
  });

  it("still exposes the public API", async () => {
    const grain = await import("../src/index.js");

    for (const name of [
      "GrainToast",
      "GrainTabs",
      "GrainModal",
      "GrainDropdown",
      "register"
    ]) {
      assert.equal(typeof grain[name], "function", `${name} should be exported`);
    }
  });

  it("registers nothing when there is no custom element registry", async () => {
    const { register } = await import("../src/index.js");

    assert.doesNotThrow(() => register());
  });

  it("keeps the browser entry point import-safe too", async () => {
    await assert.doesNotReject(() => import("../src/iife.js"));
  });
});
