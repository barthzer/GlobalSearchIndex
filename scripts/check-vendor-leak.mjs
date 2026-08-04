// Garde-fou : AUCUN terme FOURNISSEUR ni champ d'API brut en surface client. Le
// prospect ne doit jamais voir un nom de fournisseur (Babbar/Haloscan/Cuik/
// CrazySERP/Ahrefs) ni une métrique brute (hostValue/hostTrust/semanticValue/BAS).
// + rappel du garde mock : imports rapport/(scores|recommendations) hors rapport.
//
// RECONSTRUIT après la perte /tmp du 2026-08-04 (règles validées Kevin). Versionné
// dans le repo durable cette fois. Sibling de check-mock-leak.mjs.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(fileURLToPath(new URL(".", import.meta.url)), "..", "src");
// Le rapport in-app mock (à câbler) a le droit d'importer ses données mock — mais
// PAS d'exposer un terme fournisseur (les patterns ci-dessous s'appliquent partout).
const ALLOW_MOCK_DIR = join(SRC, "app", "dashboard", "rapport");

// Marques (insensible casse) + champs bruts + BAS (MAJUSCULES, mot entier — le
// « bas » français est légitime).
const PATTERNS = [
  { re: /\bBABBAR\b/i, name: "BABBAR" },
  { re: /\bHaloscan\b/i, name: "Haloscan" },
  { re: /\bCuik\b/i, name: "Cuik" },
  { re: /\bCrazySERP\b/i, name: "CrazySERP" },
  { re: /\bAhrefs\b/i, name: "Ahrefs" },
  { re: /\bBAS\b/, name: "BAS (majuscules)" }, // sensible à la casse
  { re: /\bhostValue\b/, name: "hostValue" },
  { re: /\bhostTrust\b/, name: "hostTrust" },
  { re: /\bsemanticValue\b/, name: "semanticValue" },
];
const MOCK_IMPORT = /from\s+["'][^"']*rapport\/(scores|recommendations)["']/;

const offenders = [];
function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(tsx?|jsx?)$/.test(p)) continue;
    const inMockDir = p.startsWith(ALLOW_MOCK_DIR);
    const lines = readFileSync(p, "utf8").split("\n");
    // Surface client = ce qui est RENDU, pas les commentaires développeur. On
    // scanne le code hors commentaires (//, /* */ mono/multi-ligne, JSX {/* */}) :
    // un terme fournisseur dans un commentaire ne fuite pas au prospect.
    let inBlock = false;
    lines.forEach((raw, i) => {
      let code = raw;
      if (inBlock) {
        const end = code.indexOf("*/");
        if (end < 0) return; // ligne entièrement en commentaire bloc
        code = code.slice(end + 2);
        inBlock = false;
      }
      code = code.replace(/\/\*.*?\*\//g, " "); // commentaires bloc inline
      const open = code.indexOf("/*");
      if (open >= 0) {
        inBlock = true;
        code = code.slice(0, open);
      }
      code = code.replace(/\/\/.*/, " "); // commentaire ligne
      if (!code.trim()) return;
      for (const { re, name } of PATTERNS) {
        if (re.test(code)) {
          offenders.push(`${p.replace(SRC, "src")}:${i + 1}  [${name}]  ${raw.trim()}`);
        }
      }
      if (!inMockDir && MOCK_IMPORT.test(code)) {
        offenders.push(`${p.replace(SRC, "src")}:${i + 1}  [mock-import]  ${raw.trim()}`);
      }
    });
  }
}
walk(SRC);

if (offenders.length) {
  console.error("\u{1F534} Fuite fournisseur / champ brut en surface client :");
  offenders.forEach((o) => console.error("  " + o));
  console.error(
    "\nRègle : aucun nom de fournisseur (Babbar/Haloscan/Cuik/CrazySERP/Ahrefs) ni métrique brute (hostValue/hostTrust/semanticValue/BAS) côté client.",
  );
  process.exit(1);
}
console.log("✓ Aucune fuite fournisseur en surface client (front Barth).");
