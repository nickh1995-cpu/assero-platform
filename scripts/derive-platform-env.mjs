#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const rootEnvPath = resolve(process.cwd(), "..", ".env");
const platformEnvPath = resolve(process.cwd(), ".env");

function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
}

const rootEnv = readFileSync(rootEnvPath, "utf8");
const kv = parseEnv(rootEnv);

const supabaseUrl = kv["SUPABASE_URL"];
const supabaseAnon = kv["SUPABASE_ANON_KEY"];
const serviceRole = kv["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !supabaseAnon) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in ../.env");
  process.exit(1);
}

let out = "";
out += `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}\n`;
out += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnon}\n`;
if (serviceRole) out += `SUPABASE_SERVICE_ROLE_KEY=${serviceRole}\n`;

writeFileSync(platformEnvPath, out);
console.log(`Wrote ${platformEnvPath}`);


