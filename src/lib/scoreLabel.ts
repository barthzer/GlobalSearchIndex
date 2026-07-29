/**
 * Interprétation lisible d'un score /100 pour les non-experts :
 * dit d'un coup d'œil si c'est bon ou mauvais, et l'objectif à viser.
 * Aligné sur le code couleur des arcs (rouge < 50, orange 50-74, vert ≥ 75).
 */
export interface ScoreBand {
  label: string;
  chip: string;
}

const BAND_LABEL: Record<"critical" | "medium" | "good", ScoreBand> = {
  critical: { label: "À traiter en priorité", chip: "border-red-500/25 bg-red-500/10 text-red-500" },
  medium: { label: "Marge de progression", chip: "border-amber-500/25 bg-amber-500/10 text-amber-500" },
  good: { label: "Un atout", chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500" },
};

// Pastille depuis la bande décidée SERVEUR (display.band) : AUCUN seuil recalculé
// côté front — le serveur a déjà tranché 50/75. C'est ce qui empêche le « 56 vs 12 ».
export function bandLabel(band: "critical" | "medium" | "good"): ScoreBand {
  return BAND_LABEL[band];
}

// Legacy : composants mock qui n'ont qu'un score brut (pas de bloc display serveur).
// Dérive la bande côté client — À NE PAS utiliser sur les cartes réelles.
export function scoreBand(score: number): ScoreBand {
  return bandLabel(score < 50 ? "critical" : score < 75 ? "medium" : "good");
}
