#!/usr/bin/env node
/**
 * Fails the build when a distributable outgrows its budget.
 *
 * "Ultra-lightweight" is the library's headline claim, so it should be a
 * checked fact rather than a promise. Budgets are gzipped bytes, since that
 * is what a browser actually downloads.
 */

import { gzipSync, brotliCompressSync } from "node:zlib";
import { readFileSync, existsSync } from "node:fs";

// Roughly 5% headroom over the current build. Tight on purpose: crossing a
// budget should prompt a conversation, not a silent bump.
const BUDGETS = {
  "dist/grain.min.css": 5_150,
  "dist/grain.min.js": 2_800
};

const format = (bytes) => `${(bytes / 1024).toFixed(2)} KB`;
const pad = (text, width) => String(text).padEnd(width);

let failed = false;
const rows = [];

for (const [file, budget] of Object.entries(BUDGETS)) {
  if (!existsSync(file)) {
    console.error(`missing ${file} — run \`npm run build\` first`);
    process.exitCode = 1;
    process.exit();
  }

  const raw = readFileSync(file);
  const gzip = gzipSync(raw, { level: 9 }).length;
  const brotli = brotliCompressSync(raw).length;
  const used = (gzip / budget) * 100;
  const over = gzip > budget;

  failed ||= over;
  rows.push({
    file,
    raw: raw.length,
    gzip,
    brotli,
    budget,
    used,
    status: over ? "OVER" : "ok"
  });
}

const width = Math.max(...rows.map((r) => r.file.length)) + 2;

console.log(
  `\n${pad("file", width)}${pad("raw", 12)}${pad("gzip", 12)}${pad("brotli", 12)}${pad("budget", 12)}used`
);
console.log("-".repeat(width + 52));

for (const row of rows) {
  console.log(
    pad(row.file, width) +
      pad(format(row.raw), 12) +
      pad(format(row.gzip), 12) +
      pad(format(row.brotli), 12) +
      pad(format(row.budget), 12) +
      `${row.used.toFixed(1)}% ${row.status === "OVER" ? "OVER BUDGET" : ""}`
  );
}

console.log();

if (failed) {
  console.error(
    "Size budget exceeded. Trim the addition, or raise the budget in scripts/size.js with a note explaining why.\n"
  );
  process.exitCode = 1;
}
