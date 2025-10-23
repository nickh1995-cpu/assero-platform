#!/usr/bin/env node
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const outPath = resolve(process.cwd(), ".env");

const vars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  // Optional server key; do not fail if missing.
  "SUPABASE_SERVICE_ROLE_KEY",
];

const lines = [];
for (const key of vars) {
  if (typeof process.env[key] === "string" && process.env[key].length > 0) {
    lines.push(`${key}=${process.env[key]}`);
  }
}

if (lines.length === 0) {
  console.error("No Supabase env vars found in current shell.");
  process.exit(1);
}

let existing = "";
if (existsSync(outPath)) {
  existing = readFileSync(outPath, "utf8");
}

const merged = new Map(
  existing
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => {
      const idx = l.indexOf("=");
      if (idx === -1) return [l, ""];
      return [l.slice(0, idx), l.slice(idx + 1)];
    })
);

for (const line of lines) {
  const idx = line.indexOf("=");
  const k = line.slice(0, idx);
  const v = line.slice(idx + 1);
  merged.set(k, v);
}

const output = Array.from(merged.entries())
  .map(([k, v]) => `${k}=${v}`)
  .join("\n");

writeFileSync(outPath, output + "\n");
console.log(`Wrote ${outPath} with ${lines.length} Supabase var(s).`);


