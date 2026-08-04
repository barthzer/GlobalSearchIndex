import { apiFetch } from './api';

// Accès API au forecast (projection de CA). Le backend ne PERSISTE que les inputs
// commerciaux (secteur, taux de conversion, panier moyen, CTR personnalisé) ; les
// scénarios sont recalculés côté client. Contrat aligné sur
// apps/api/src/forecast (GET + PATCH /projects/:projectId/forecast, DTO snake_case).

// ─────────────────────────────────────────────────────────────────────────────
// Types du contrat serveur (ForecastResponse)
// ─────────────────────────────────────────────────────────────────────────────

// Un scénario recalculé côté serveur (renvoyé à titre indicatif ; le composant
// recalcule les siens depuis le trafic concurrent réel).
export interface ForecastScenario {
  label: 'pessimistic' | 'realistic' | 'optimistic';
  impressions: number;
  ctr_sector: number;
  seo_traffic: number;
  conversion_rate: number;
  leads: number;
  average_basket: number;
  revenue: number;
}

// Réponse du GET /projects/:projectId/forecast. Tous les inputs sont nullables :
// une projection sans row renvoie un objet « vide » (has_semantic_data indique si
// la donnée sémantique est dispo → empty state vs loader côté UI).
export interface ForecastResponse {
  sector: string | null;
  ctr_sector: number | null;
  ctr_custom: number | null;
  conversion_rate: number | null;
  average_basket: number | null;
  competitors_used: string[];
  scenarios: ForecastScenario[];
  has_semantic_data: boolean;
}

// Payload de l'auto-save (PATCH). Tous les champs optionnels : le front envoie ce
// qu'il connaît, le serveur merge avec l'état persisté. Aligné sur UpdateForecastDto.
export interface SaveForecastInput {
  sector?: string;
  conversion_rate?: number;
  average_basket?: number;
  ctr_custom?: number | null;
}

// Objet « vide » défendable renvoyé si le GET échoue (réseau, 4xx/5xx) : aucun
// chiffre inventé, tout à null → le composant reste sur l'empty state.
const EMPTY_FORECAST: ForecastResponse = {
  sector: null,
  ctr_sector: null,
  ctr_custom: null,
  conversion_rate: null,
  average_basket: null,
  competitors_used: [],
  scenarios: [],
  has_semantic_data: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Opérations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère la projection persistée d'un projet. En cas d'échec (ou réponse null
 * côté serveur), renvoie une projection vide plutôt que de lever : l'hydratation
 * des inputs est non-bloquante et ne doit jamais casser l'affichage.
 */
export async function fetchForecast(projectId: string): Promise<ForecastResponse> {
  const res = await apiFetch(`/projects/${projectId}/forecast`);
  if (!res.ok) return EMPTY_FORECAST;
  const data = (await res.json()) as ForecastResponse | null;
  return data ?? EMPTY_FORECAST;
}

/**
 * Persiste (upsert idempotent) les inputs commerciaux via PATCH. Best-effort :
 * appelé par le debounce d'auto-save. Renvoie la réponse serveur (scénarios
 * recalculés). Lève sur échec HTTP pour que l'appelant puisse ignorer/réessayer.
 */
export async function saveForecast(
  projectId: string,
  input: SaveForecastInput,
): Promise<ForecastResponse> {
  const res = await apiFetch(`/projects/${projectId}/forecast`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`forecast save ${res.status}`);
  return (await res.json()) as ForecastResponse;
}
