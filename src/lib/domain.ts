// Helpers d'AFFICHAGE des noms de domaine. Purement cosmétique : ces fonctions
// ne servent qu'au rendu. Les données stockées (API, tri, clés) restent INTACTES.
//
// Décision Kevin (benchmark Autorité ↔ pilier GEO) : aligner l'affichage des
// concurrents en strippant le préfixe `www.` À L'AFFICHAGE UNIQUEMENT, sans
// toucher aux données brutes. Source unique pour éviter la divergence entre vues.

/**
 * Retire un préfixe `www.` en tête (insensible à la casse), rien d'autre.
 * Les sous-domaines légitimes (`blog.`, `api.`, `shop.`…) sont préservés.
 * Ex : `www.we-van.com` → `we-van.com` ; `blog.example.com` → inchangé.
 */
export function stripWww(domain: string): string {
  return domain.replace(/^www\./i, "");
}

/**
 * Nom lisible d'un domaine pour l'affichage : retire le protocole, le préfixe
 * `www.` et le chemin. Ne touche pas aux sous-domaines légitimes.
 * Ex : `https://www.we-van.com/vans` → `we-van.com`.
 */
export function prettyDomain(input: string): string {
  return stripWww(
    input
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .trim(),
  ).trim();
}
