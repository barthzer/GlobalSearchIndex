import type { NextConfig } from "next";

// Front Barth déployé sous /barth-staging (staging). Export statique (nginx sert
// out/), trailingSlash pour le fallback nginx (token /report/ lu côté client),
// images non optimisées (contrainte de l'export statique).
//
// ⚠️ RECONSTRUIT après la perte /tmp du 2026-08-04 (valeurs confirmées depuis le
//    out/ déployé : basePath baké /barth-staging, dossiers trailingSlash).
// ⚠️ Bascule PROD : basePath "/barth" (adapter avant le build prod).
// ⚠️ TOUJOURS builder avec `next build --webpack` (turbopack produit des chunks
//    instables `..js` qui cassent l'hydratation — voir package.json).
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/barth-staging",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
