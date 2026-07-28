import { apiFetch } from "./api";

export interface Reco {
  axe?: string;
  pillar?: string;
  diagnostic?: string; // v4
  probleme?: string; // v3
  observation?: string;
  objectif?: string;
  action: string;
  impact: "Fort" | "Moyen" | "Faible";
  gain?: string;
  prospectVisible?: boolean;
}
export interface RecoContent {
  intro?: string;
  cta?: string;
  recommendations: Reco[];
}

export async function fetchRecommendations(
  projectId: string,
): Promise<RecoContent | null> {
  const res = await apiFetch(`/projects/${projectId}/recommendations`);
  // Pas encore de recos (moins de 2 scores, ou pas générées) → null, pas une erreur.
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`recommendations ${res.status}`);
  const data = (await res.json().catch(() => null)) as RecoContent | null;
  if (!data || !Array.isArray(data.recommendations)) return null;
  return data;
}

/** « non chiffrable » ⇒ on masque la ligne gain (jamais un faux chiffre, jamais un chiffre creux). */
export function gainIsChiffrable(gain?: string): boolean {
  return !!gain && !/non\s*chiffrable/i.test(gain);
}
