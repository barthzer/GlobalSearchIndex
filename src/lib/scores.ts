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
  // Bande /100 décidée SERVEUR (rouge < 50, ambre 50-74, vert >= 75). Le front la
  // LIT pour la couleur d'arc et la pastille — il ne recalcule pas les seuils.
  band: "critical" | "medium" | "good" | null;
  label: string | null;
  message: string | null;
  caption: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pilier IA — contexte relatif du panel GEO (source unique, plus de type local).
// Produit SERVEUR dans le display du score `geo_citations` (extension du
// ScoreDisplay). Le front ne décide RIEN : il rend geoContext tel que résolu.
// ─────────────────────────────────────────────────────────────────────────────

// Détail nominatif par concurrent (contrat SEO Engine livré :
// details.competitor_breakdown[] → mappé serveur en {domain, citedPages,
// excluded}). Optionnel : si absent côté backend → repli agrégat (userPages /
// médiane / leader) dans PilierIA. `excluded=true` → concurrent exclu du calcul
// (rank null) : affiché « non mesuré », JAMAIS compté comme 0.
export interface CompetitorBreakdownEntry {
  domain: string;
  citedPages: number;
  excluded?: boolean;
}

export interface GeoContext {
  userPages: number;
  medianPanelPages: number;
  leaderPages: number;
  // Cadre narratif du bandeau d'écart. null → pas d'argumentaire (neutre/technique).
  // 'locked' → pré-déblocage : appel à débloquer l'analyse concurrentielle.
  frame: "opportunite" | "urgence" | "technique" | "locked" | null;
  panelState?: string | null;
  // Détail nominatif par concurrent. SI présent → liste « nom + pages citées »
  // avec « Vous » surligné à son rang réel. SI absent → repli agrégat.
  competitorBreakdown?: CompetitorBreakdownEntry[];
}

// Le display Citations transporte le geoContext (extension du ScoreDisplay serveur).
export type GeoCitationsDisplay = ScoreDisplay & { geoContext?: GeoContext | null };

export interface ProjectScore {
  scoreType:
    | "seo_technical"
    | "geo_citability"
    | "geo_citations"
    | "authority"
    | "semantic"
    | "page_speed"
    | "notoriete";
  scoreValue: number | null;
  // 'locked' = score non encore déclenché (sémantique/geo_citations avant déblocage).
  status: "locked" | "pending" | "processing" | "completed" | "error";
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

// ─────────────────────────────────────────────────────────────────────────────
// Pilier IA — dérive les DEUX displays (Lisibilité + Citations) à partir d'un
// tableau de scores serveur. Source unique partagée par le dashboard (AnalyseTab)
// et le rapport prospect (/report). Le front ne décide RIEN : il rend le display
// résolu par buildScoreDisplay. La seule logique ici = le REPLI défensif quand un
// score est absent (projet sans déblocage sémantique → pas de cascade geo, ou
// geo_citations pas encore livré par SEO Engine).
// ─────────────────────────────────────────────────────────────────────────────

// Display « Lisibilité » (arc gauche) : le score geo_citability résolu, ou un
// état non-scorable neutre si absent (jamais un arc qui disparaît).
export function readabilityDisplay(
  scores: { scoreType: string; display: ScoreDisplay }[],
): ScoreDisplay {
  const sc = scores.find((s) => s.scoreType === "geo_citability");
  if (sc) return sc.display;
  return {
    type: "geo",
    scorable: false,
    value: null,
    absolute: false,
    neutralArc: false,
    tone: "muted",
    band: null,
    label: null,
    message: "Lisibilité IA non disponible pour ce projet.",
    caption: "Lisibilité IA",
  };
}

// Accès des crawlers IA — lu dans geo_citability.complementary (ai_crawlers_*).
// Sert au caveat de citabilité : le score geo_citability note la STRUCTURE du
// contenu (réponse directe, schema, FAQ…), PAS l'accès des bots. Un site peut donc
// marquer 100 tout en bloquant GPTBot/ClaudeBot/PerplexityBot → incitable en
// pratique. On surface cette incohérence côté carte. null = donnée non mesurée.
export interface AiCrawlerAccess {
  blocked: string[];
  allowed: string[];
  /** true → tous les bots connus sont bloqués (aucun autorisé) : incitable. */
  allBlocked: boolean;
}
export function aiCrawlerAccess(
  scores: { scoreType: string; rawData: Record<string, unknown> | null }[],
): AiCrawlerAccess | null {
  const raw = scores.find((s) => s.scoreType === "geo_citability")?.rawData as
    | {
        complementary?: {
          ai_crawlers_blocked?: unknown;
          ai_crawlers_allowed?: unknown;
        };
      }
    | null
    | undefined;
  const comp = raw?.complementary;
  if (!comp) return null;
  const toStr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  const blocked = toStr(comp.ai_crawlers_blocked);
  const allowed = toStr(comp.ai_crawlers_allowed);
  if (blocked.length === 0 && allowed.length === 0) return null;
  return {
    blocked,
    allowed,
    allBlocked: blocked.length > 0 && allowed.length === 0,
  };
}

// Display « Citations » (arc droit) : le score geo_citations résolu (avec son
// geoContext), ou un état neutre « en attente » si absent/locked. Jamais 0/100,
// jamais de crash. Absent = projet sans cascade geo (déblocage sémantique requis)
// ou champ pas encore livré par SEO Engine.
export function citationsDisplay(
  scores: { scoreType: string; display: ScoreDisplay }[],
): GeoCitationsDisplay {
  const sc = scores.find((s) => s.scoreType === "geo_citations");
  if (sc) return sc.display as GeoCitationsDisplay;
  return {
    type: "geo",
    scorable: false,
    value: null,
    absolute: false,
    neutralArc: false,
    tone: "muted",
    band: null,
    label: "en attente",
    message:
      "La citabilité par les IA se débloque avec l'analyse sémantique (concurrents du panel).",
    caption: "Citations IA",
    geoContext: null,
  };
}
