import type { NextConfig } from "next";

// Front Barth. Export statique (nginx sert out/), trailingSlash pour le fallback
// nginx (token /report/ lu côté client), images non optimisées (export statique).
//
// basePath PILOTÉ PAR ENV (`NEXT_PUBLIC_BASE_PATH`) — un seul point de vérité pour
// l'URL libre accès :
//   • non défini      → "/barth-staging" (staging, comportement par défaut)
//   • "" (vide)       → racine "/"        (bascule PROD : `NEXT_PUBLIC_BASE_PATH= pnpm build`)
//   • autre slug      → ce slug
// La valeur résolue est réinjectée dans le bundle (`env`) pour que le helper
// `asset()` (src/lib/asset.ts) préfixe les chemins d'assets bruts (<img>, favicon,
// backgrounds) que Next ne préfixe pas automatiquement (contrairement à <Link>/router).
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
