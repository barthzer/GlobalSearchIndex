/**
 * Interprétation lisible d'un score /100 pour les non-experts :
 * dit d'un coup d'œil si c'est bon ou mauvais, et l'objectif à viser.
 * Aligné sur le code couleur des arcs (rouge < 50, orange 50-74, vert ≥ 75).
 */
export interface ScoreBand {
  label: string;
  chip: string;
}

export function scoreBand(score: number): ScoreBand {
  if (score < 50) return { label: "À traiter en priorité", chip: "border-red-500/25 bg-red-500/10 text-red-500" };
  if (score < 75) return { label: "Marge de progression", chip: "border-amber-500/25 bg-amber-500/10 text-amber-500" };
  return { label: "Un atout", chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500" };
}
