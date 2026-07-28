#!/usr/bin/env node
/**
 * Checks that what package.json promises actually exists in dist/.
 *
 * A broken `exports` map or a renamed output file only surfaces after
 * publishing, when someone's install breaks. This catches it in CI instead.
 */

import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const problems = [];
const checked = new Set();

/** Walks the string leaves of an exports entry. */
const collect = (value, label) => {
  if (typeof value === "string") {
    checked.add(`${label} -> ${value}`);
    if (!existsSync(value)) {
      problems.push(`${label} points at missing file ${value}`);
    }
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      collect(nested, `${label}.${key}`);
    }
  }
};

for (const field of ["main", "module", "types", "style"]) {
  if (pkg[field]) {
    collect(pkg[field], field);
  }
}

for (const [subpath, value] of Object.entries(pkg.exports ?? {})) {
  collect(value, `exports["${subpath}"]`);
}

const EXPECTED_API = [
  "GrainToast",
  "GrainTabs",
  "GrainModal",
  "GrainDropdown",
  "register"
];

const namespace = await import(pathToFileURL(pkg.main).href).catch((error) => {
  problems.push(`importing ${pkg.main} threw: ${error.message}`);
  return null;
});

if (namespace) {
  for (const name of EXPECTED_API) {
    if (!(name in namespace)) {
      problems.push(`${pkg.main} does not export ${name}`);
    }
  }
}

// The IIFE build is what CDN users load; it must assign the global.
const iife = readFileSync("dist/grain.min.js", "utf8");
if (!iife.includes("GrainUI")) {
  problems.push("dist/grain.min.js never references the GrainUI global");
}

for (const entry of [...checked].sort()) {
  console.log(`  ok  ${entry}`);
}

if (problems.length > 0) {
  console.error("\nPackage verification failed:");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error();
  process.exitCode = 1;
} else {
  console.log(
    `\n${checked.size} entry points resolve, ${EXPECTED_API.length} exports present.\n`
  );
}
