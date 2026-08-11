// Préfixe basePath-aware pour les assets servis depuis public/ (images, logos,
// favicon, backgrounds). Next préfixe automatiquement <Link>/router avec le basePath,
// mais PAS les chaînes brutes (<img src>, metadata icons, url(...) en style). Ce
// helper comble le trou : `NEXT_PUBLIC_BASE_PATH` est la valeur résolue du basePath,
// injectée au build par next.config (bakée dans le bundle serveur ET client).
//
//   asset("/faviconGSI.svg")  ->  "/barth-staging/faviconGSI.svg"  (staging)
//                             ->  "/faviconGSI.svg"                 (racine / prod)
//
// Point de vérité unique : renommer l'URL libre accès = changer NEXT_PUBLIC_BASE_PATH
// au build, aucun chemin en dur à toucher.
export function asset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path}`;
}
