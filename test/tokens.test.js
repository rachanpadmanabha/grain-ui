import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const css = readFileSync(new URL("../src/tokens.css", import.meta.url), "utf8");

/** Extracts the declarations of the rule whose selector starts at `index`. */
const declarationsAt = (index) => {
  const start = css.indexOf("{", index);
  let depth = 0;
  let end = start;

  while (end < css.length) {
    if (css[end] === "{") depth += 1;
    else if (css[end] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
    end += 1;
  }

  const body = css.slice(start + 1, end);
  return Object.fromEntries(
    [...body.matchAll(/([-\w]+)\s*:\s*([^;]+);/g)].map(([, key, value]) => [
      key,
      value.trim()
    ])
  );
};

/** Anchors on a line start so `:not([data-theme="light"])` cannot match. */
const rule = (selector) => {
  const match = new RegExp(`^${selector}\\s*\\{`, "m").exec(css);
  assert.ok(match, `expected a rule for ${selector}`);
  return declarationsAt(match.index);
};

describe("theme tokens", () => {
  it("keeps the two dark palettes in sync", () => {
    // These blocks are unavoidable twins: "OS prefers dark" and "author asked
    // for dark" cannot share a rule in CSS. This test is what stops them
    // drifting apart.
    const mediaDark = declarationsAt(
      css.indexOf(':root:not([data-theme="light"])')
    );
    const explicitDark = rule('\\[data-theme="dark"\\]');

    assert.deepEqual(explicitDark, mediaDark);
  });

  it("declares the light palette exactly once", () => {
    // :root and [data-theme="light"] share a single rule. Counting a sentinel
    // value catches a re-introduced duplicate block regardless of how it is
    // formatted.
    const occurrences = css.match(/--gr-bg: hsl\(0 0% 100%\);/g) ?? [];

    assert.equal(occurrences.length, 1);
    assert.match(css, /^:root,\n\[data-theme="light"\] \{/m);
  });

  it("declares the dark palette exactly twice", () => {
    const occurrences = css.match(/--gr-bg: hsl\(0 0% 9%\);/g) ?? [];

    assert.equal(
      occurrences.length,
      2,
      "one for prefers-color-scheme, one for [data-theme=dark], and no more"
    );
  });

  it("gives every themed token a value in both palettes", () => {
    const light = rule(':root,\\n\\[data-theme="light"\\]');
    const dark = rule('\\[data-theme="dark"\\]');

    assert.deepEqual(
      Object.keys(light).sort(),
      Object.keys(dark).sort(),
      "light and dark must define the same token set"
    );
  });

  it("declares a color-scheme for each palette", () => {
    assert.equal(
      rule(':root,\\n\\[data-theme="light"\\]')["color-scheme"],
      "light"
    );
    assert.equal(rule('\\[data-theme="dark"\\]')["color-scheme"], "dark");
  });
});
