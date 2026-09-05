/**
 * Neutralise les tokens présents dans une URL avant de l'envoyer côté serveur
 * (ex. email de signalement de bug). Sur `/report/:token`, le token d'accès au
 * rapport prospect (équivalent bearer, lookup DB) vit dans le PATH → sans rédaction
 * il partirait en clair dans un email interne + un enregistrement de bug, rejouable
 * jusqu'à expiration. Idem pour un éventuel `#magic=<token>` resté dans le fragment.
 * Rédaction défensive, aucune donnée sensible ne sort.
 */
export function redactSensitiveUrl(href: string): string {
  return href
    .replace(/(\/report\/)[^/?#]+/i, "$1<redacted>")
    .replace(/([#&]magic=)[^&]+/i, "$1<redacted>");
}
