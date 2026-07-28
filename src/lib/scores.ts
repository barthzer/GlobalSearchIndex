import { apiFetch } from "./api";

// Bloc d'affichage résolu SERVEUR (buildScoreDisplay, audience internal). Le front
// ne recalcule NI la couleur, NI le régime, NI le scorable — il rend ce bloc.
// C'est ce qui empêche l'arc gris de re-casser (couleur pilotée par tone/neutralArc,
// pas par la valeur côté client).
export interface ScoreDisplay {
  type: "seo" | "geo" | "semantic" | "authority";
  scorable: boolean; // false → AUCUN chiffre, on affiche message
  value: number | null;
  absolute: boolean; // true → échelle non-/100 (BAS absolu / legacy) → arc neutre
  neutralArc: boolean; // arc gris : absolu OU confiance réduite
  tone: "ok" | "warn" | "muted";
  label: string | null;
  message: string | null;
  caption: string;
}

export interface ProjectScore {
  scoreType:
    | "seo_technical"
    | "geo_citability"
    | "authority"
    | "semantic"
    | "page_speed"
    | "notoriete";
  scoreValue: number | null;
  status: "pending" | "processing" | "completed" | "error";
  rawData: Record<string, unknown> | null;
  display: ScoreDisplay;
}

export async function fetchProjectScores(
  projectId: string,
): Promise<ProjectScore[]> {
  const res = await apiFetch(`/projects/${projectId}/scores`);
  if (!res.ok) throw new Error(`scores ${res.status}`);
  return (await res.json()) as ProjectScore[];
}

/** true tant qu'un score est en cours → le front repolle. */
export function anyProcessing(scores: ProjectScore[]): boolean {
  return scores.some(
    (s) => s.status === "pending" || s.status === "processing",
  );
}
