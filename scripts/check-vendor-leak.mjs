#!/usr/bin/env node
/**
 * GATE ANTI-FUITE FOURNISSEUR (front Barth) — échoue le build si un nom de
 * fournisseur de données apparaît dans le code rendu au client. Non négociable :
 * le prospect (et le rapport) ne doivent jamais voir la source des données.
 *
 * Le front Barth est intégralement une surface client → on scanne tout src/,
 * commentaires strippés (un commentaire ne se rend pas). Aligné sur le gate du
 * monorepo GSI (scripts/check-vendor-leak.mjs).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const FORBIDDEN = /\b(babbar|haloscan|cuik|crazyserp|ahrefs)\b/i;
const EXTS = [".ts", ".tsx"];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      out.push(...walk(full));
    } else if (EXTS.some((e) => name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

/** Retire block et line comments (défensif) — les strings rendus restent scannés. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");
}

let hits = 0;
for (const file of walk(SRC)) {
  const scanned = stripComments(readFileSync(file, "utf8"));
  scanned.split("\n").forEach((line, i) => {
    const m = line.match(FORBIDDEN);
    if (m) {
      hits++;
      console.error(
        `  FUITE FOURNISSEUR  ${file.replace(ROOT + "/", "")}:${i + 1}  « ${m[0]} »\n    ${line.trim().slice(0, 120)}`,
      );
    }
  });
}

if (hits > 0) {
  console.error(`\n✗ ${hits} fuite(s) fournisseur en surface client. Build bloqué.`);
  process.exit(1);
}
console.log("✓ Aucune fuite fournisseur en surface client (front Barth).");
