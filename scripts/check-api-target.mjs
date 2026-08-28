// Garde-fou POST-BUILD : un build PROD ne doit JAMAIS parler à l'API STAGING.
// Un front prod qui pointe sur /api-staging = funnel misrouté, sessions et liens
// magiques cassés, écrans vides. Diagnostic long à la main (02/08 : des heures ;
// 28/08 : re-belote). Ce contrôle rend l'erreur IMPOSSIBLE à shipper sans le voir.
//
// Sibling de check-vendor-leak.mjs / check-mock-leak.mjs, mais POST-build : il
// scanne le `out/` compilé (l'URL d'API n'existe que dans les chunks générés, pas
// dans la source). Câblé APRÈS `next build` dans le script `build`.
//
// Règle : si build PROD (NEXT_PUBLIC_BASE_PATH === "/diagnostic-gratuit") ET un
// fichier de out/ référence `gsi.aw-i.com/api-staging` → ÉCHEC (exit 1). En build
// staging, api-staging est LÉGITIME → on passe.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "out");
const PROD_BASE_PATH = "/diagnostic-gratuit";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isProdBuild = basePath === PROD_BASE_PATH;

if (!existsSync(OUT)) {
  console.log("✓ check-api-target : pas de dossier out/ (export statique absent), skip.");
  process.exit(0);
}
if (!isProdBuild) {
  console.log(
    `✓ check-api-target : build non-prod (basePath="${basePath || "défaut → staging"}") — api-staging autorisé.`,
  );
  process.exit(0);
}

const STAGING_API = /gsi\.aw-i\.com\/api-staging/;
const offenders = [];
function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(js|html|txt|json)$/.test(p)) continue;
    if (STAGING_API.test(readFileSync(p, "utf8"))) {
      offenders.push(p.replace(OUT, "out"));
    }
  }
}
walk(OUT);

if (offenders.length) {
  console.error(
    "\u{1F534} BUILD PROD qui parle à l'API STAGING — refusé (front prod cassé garanti).",
  );
  console.error(
    `   basePath=${basePath} mais ${offenders.length} fichier(s) référencent gsi.aw-i.com/api-staging :`,
  );
  offenders.slice(0, 10).forEach((o) => console.error("  " + o));
  if (offenders.length > 10) console.error(`  … (+${offenders.length - 10})`);
  console.error(
    "\nCause : .env.production force NEXT_PUBLIC_API_URL=…/api-staging (config du build STAGING).",
  );
  console.error(
    "Fix : rebuilder la PROD avec l'override →\n  NEXT_PUBLIC_BASE_PATH=/diagnostic-gratuit NEXT_PUBLIC_API_URL=https://gsi.aw-i.com/api pnpm build",
  );
  process.exit(1);
}
console.log(
  "✓ check-api-target : build prod → API /api (aucune référence api-staging).",
);
