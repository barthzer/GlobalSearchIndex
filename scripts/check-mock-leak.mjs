// Garde-fou : AUCUN import des données MOCK (rapport/scores.ts, rapport/
// recommendations.ts) dans un écran CÂBLÉ. Règle du port : les composants de
// Barth, NOS données — jamais ses données. Les données mock ne vivent que dans
// le rapport in-app (src/app/dashboard/rapport/), qui n'est pas encore câblé.
//
// Deuxième récidive d'un mock de Barth dans un flux réel (scores dashboard J1,
// puis recos analyse) → ce test ferme la classe automatiquement au build.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(fileURLToPath(new URL(".", import.meta.url)), "..", "src");
// Autorisé UNIQUEMENT dans le rapport in-app mock (à câbler ultérieurement).
const ALLOW_DIR = join(SRC, "app", "dashboard", "rapport");
const FORBIDDEN = /from\s+["'][^"']*rapport\/(scores|recommendations)["']/;

const offenders = [];
function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(tsx?|jsx?)$/.test(p)) continue;
    if (p.startsWith(ALLOW_DIR)) continue; // le rapport mock a le droit
    const lines = readFileSync(p, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (FORBIDDEN.test(line)) {
        offenders.push(`${p.replace(SRC, "src")}:${i + 1}  ${line.trim()}`);
      }
    });
  }
}
walk(SRC);

if (offenders.length) {
  console.error(
    "\u{1F534} Import de données MOCK (rapport/scores|recommendations) hors du rapport in-app :",
  );
  offenders.forEach((o) => console.error("  " + o));
  console.error(
    "\nRègle du port : ses composants, NOS données. Les données mock ne vivent que dans src/app/dashboard/rapport/.",
  );
  process.exit(1);
}
console.log("✓ Aucune fuite de données mock (rapport/scores|recommendations) dans les écrans câblés.");
