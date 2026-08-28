// Recommandations stratégiques (surface INTERNE commerciale). Contrairement au
// rapport prospect (lib/report.ts, PUBLIC sans JWT), ce chemin passe par apiFetch
// (Bearer user, ou réécriture prospect gérée dans lib/api.ts). Le serveur applique
// déjà cap + filtre pilier non-calculable + compte cohérent (getInternalContent) :
// Barth ne fait que RENDRE le contenu, aucun recalcul métier ici.
import { apiFetch } from "@/lib/api";

// Une recommandation. Champs alignés sur le contrat backend
// (entities/recommendation.entity.ts → content.recommendations[]) ET sur
// lib/report.ts (ReportReco). Seuls `axe`, `impact` et `action` sont garantis ;
// le reste est optionnel car l'accès est conditionnel côté composants
// (RealRecommendationCard lit axe/pillar, diagnostic/probleme/observation,
// objectif, impact, action).
export interface Reco {
  // Pilier porté par la reco (libellé). `pillar` est un alias toléré (fallback UI).
  axe: string;
  pillar?: string;
  // Impact commercial → mappé en priorité P1/P2/P3 côté carte.
  impact: "Fort" | "Moyen" | "Faible";
  // Action à mener (encart gris). Toujours présent côté backend.
  action: string;
  // Constat technique — plusieurs sources historiques (v3 probleme, v4 diagnostic).
  // `observation` est un alias toléré (fallback UI).
  probleme?: string;
  diagnostic?: string;
  observation?: string;
  // Titre marché (wording orienté objectif). Absent = le constat sert de titre.
  objectif?: string;
  // Gain estimé (optionnel, porté par certaines versions du générateur).
  gain?: string;
}

// Contenu renvoyé par l'endpoint recos : la liste + un CTA de conclusion optionnel.
// Shape identique à report.ts ({ recommendations, cta? }) et au JSONB backend.
export interface RecoContent {
  recommendations: Reco[];
  cta?: string;
  /** Gate expert-first : nombre de recos masquées côté serveur (payload prospect tronqué
   *  à 4). 0/absent = tout est reçu (commercial). Le front rend le teaser d'après ça. */
  lockedCount?: number;
}

// Récupère les recommandations d'un projet via apiFetch (même canal que le reste
// de l'app : Bearer user côté commercial, réécriture /public côté prospect gérée
// dans lib/api.ts). 404 = recos pas encore générées → RecoContent vide (jamais un
// throw : le composant affiche un état « non disponibles »). Les autres erreurs
// (5xx, réseau) remontent pour déclencher l'état d'erreur explicite.
/**
 * POINT DE LECTURE UNIQUE de l'enveloppe recos `{recommendations, cta, lockedCount}`.
 * TOUT chemin qui consomme un payload recos (dashboard via fetchRecommendations, rapport
 * prospect via report.ts, badge Header) DOIT passer par ici — jamais de ré-extraction
 * manuelle. Sinon un chemin oublie `lockedCount` et le masque diverge (bug 28/08 : le
 * dashboard ne masquait pas alors que /report oui). Générique sur l'item (Reco côté
 * dashboard, ReportReco côté rapport) : seule l'ENVELOPPE est normalisée ici, le mapping
 * d'item (pilier→pillar) reste au caller. Voir [[feedback_two_paths_must_agree]].
 */
export function parseRecoContent<T = Reco>(raw: unknown): {
  recommendations: T[];
  cta?: string;
  lockedCount?: number;
} {
  const d = (raw ?? {}) as {
    recommendations?: T[];
    cta?: string;
    lockedCount?: number;
  };
  return {
    recommendations: d.recommendations ?? [],
    cta: d.cta,
    lockedCount: d.lockedCount,
  };
}

export async function fetchRecommendations(
  projectId: string,
): Promise<RecoContent> {
  const res = await apiFetch(
    `/projects/${encodeURIComponent(projectId)}/recommendations`,
  );
  if (res.status === 404) {
    return { recommendations: [] };
  }
  if (!res.ok) {
    throw new Error(`recommendations ${res.status}`);
  }
  return parseRecoContent<Reco>(await res.json());
}
