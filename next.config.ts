import type { NextConfig } from "next";

// Front Barth. Export statique (nginx sert out/), trailingSlash pour le fallback
// nginx (token /report/ lu côté client), images non optimisées (export statique).
//
// basePath PILOTÉ PAR ENV (`NEXT_PUBLIC_BASE_PATH`) — un seul point de vérité pour
// l'URL libre accès :
//   • non défini      → "/barth-staging" (staging, comportement PAR DÉFAUT)
//   • "/diagnostic-gratuit" → PROD
//   • autre slug      → ce slug
// La valeur résolue est réinjectée dans le bundle (`env`) pour que le helper
// `asset()` (src/lib/asset.ts) préfixe les chemins d'assets bruts (<img>, favicon,
// backgrounds) que Next ne préfixe pas automatiquement (contrairement à <Link>/router).
//
// ⚠️ DEUX CIBLES EXPLICITES (package.json) — plus AUCUN build implicite (refonte
//    28/08, après 2 incidents 02/08 + 28/08 de front prod pointant sur l'API staging) :
//      pnpm build:staging  → NEXT_PUBLIC_BASE_PATH=/barth-staging     + API /api-staging
//      pnpm build:prod     → NEXT_PUBLIC_BASE_PATH=/diagnostic-gratuit + API /api
//    Chaque commande porte SES DEUX variables (basePath + URL d'API) en dur. Le
//    `pnpm build` nu échoue avec un message (pas de défaut silencieux). Plus de
//    .env.production (supprimé : c'était un fichier « production » qui pointait vers
//    staging = piège permanent).
//    Garde-fou : scripts/check-api-target.mjs (post-build) détecte la cible depuis le
//    out/ compilé et échoue un build PROD contenant encore api-staging.
//
// ⚠️ TOUJOURS builder avec `next build --webpack` (turbopack produit des chunks
//    instables `..js` qui cassent l'hydratation — voir package.json).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/barth-staging";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
