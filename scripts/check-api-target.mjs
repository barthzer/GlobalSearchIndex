// Garde-fou POST-BUILD : un build PROD ne doit JAMAIS parler à l'API STAGING.
// Un front prod qui pointe sur /api-staging = funnel misrouté, sessions et liens
// magiques cassés, écrans vides. Diagnostic long à la main (02/08 : des heures ;
// 28/08 : re-belote). Ce contrôle rend l'erreur IMPOSSIBLE à shipper sans la voir.
//
// Sibling de check-vendor-leak.mjs / check-mock-leak.mjs, mais POST-build : il
// scanne le `out/` COMPILÉ (l'URL d'API n'existe que dans les chunks générés). Câblé
// APRÈS `next build` dans `build:staging` / `build:prod`.
//
// Le TARGET (prod vs staging) est déduit du `out/` lui-même — le basePath est cuit
// dans le HTML (`/diagnostic-gratuit/_next` = prod, `/barth-staging/_next` = staging).
// On NE dépend PAS d'une variable d'env (dans une chaîne `&&`, l'env inline passé au
// seul `next build` ne serait pas visible ici → faux négatif).
//
// Règle : build PROD + un fichier de out/ référence `gsi.aw-i.com/api-staging`
// → ÉCHEC (exit 1). Build staging → api-staging légitime, on passe.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "out");
const PROD_BASE_PATH = "/diagnostic-gratuit";
const STAGING_API = /gsi\.aw-i\.com\/api-staging/;

if (!existsSync(OUT)) {
  console.log("✓ check-api-target : pas de dossier out/ (export statique absent), skip.");
  process.exit(0);
}

// Détecte la cible depuis le HTML compilé (basePath cuit dans les refs `_next`).
function detectBasePath() {
  for (const f of ["404.html", "index.html"]) {
    const p = join(OUT, f);
    if (!existsSync(p)) continue;
    const html = readFileSync(p, "utf8");
    if (html.includes(`${PROD_BASE_PATH}/_next`)) return PROD_BASE_PATH;
    if (html.includes("/barth-staging/_next")) return "/barth-staging";
    const m = html.match(/\/([a-z0-9-]+)\/_next/);
    if (m) return `/${m[1]}`;
  }
  return null;
}

const basePath = detectBasePath();
if (basePath !== PROD_BASE_PATH) {
  console.log(
    `✓ check-api-target : build non-prod (basePath=${basePath ?? "indéterminé"}) — api-staging autorisé.`,
  );
  process.exit(0);
}

const offenders = [];
function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(js|html|txt|json)$/.test(p)) continue;
    if (STAGING_API.test(readFileSync(p, "utf8"))) offenders.push(p.replace(OUT, "out"));
  }
}
walk(OUT);

if (offenders.length) {
  console.error(
    "\u{1F534} BUILD PROD qui parle à l'API STAGING — refusé (front prod cassé garanti).",
  );
  console.error(
    `   basePath=${PROD_BASE_PATH} mais ${offenders.length} fichier(s) référencent gsi.aw-i.com/api-staging :`,
  );
  offenders.slice(0, 10).forEach((o) => console.error("  " + o));
  if (offenders.length > 10) console.error(`  … (+${offenders.length - 10})`);
  console.error(
    "\nFix : builder la PROD avec `pnpm build:prod` (basePath /diagnostic-gratuit + API /api).",
  );
  process.exit(1);
}
console.log(
  "✓ check-api-target : build prod → API /api (aucune référence api-staging).",
);
