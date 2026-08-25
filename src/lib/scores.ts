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
  // Layout décidé SERVEUR (modèle composite) : la carte le LIT et rend, elle ne
  // route rien (invariant « 56 vs 12 »). Toujours présent depuis le serveur ;
  // optionnel côté type pour tolérer les maquettes mockées (repli 'lock').
  //  'lock' → verrou pré-déblocage · 'composite' → score consolidé (chiffre +
  //  2 sous-composantes) · 'statement' → constat qualitatif, technique en sous-ligne.
  layout?: "lock" | "composite" | "statement";
  // Chiffre composite en tête (= round(0.4·technique + 0.6·citations)). Non-null
  // UNIQUEMENT en layout 'composite'. null ≠ 0.
  composite?: number | null;
  // true → composite DÉGRADÉ calculé côté GSI (concurrents_cites_pas_vous, 0 citation
  // mesurée). La carte affiche le constat « pas vous » au-dessus de l'arc.
  degraded?: boolean;
  // Sous-composante « Technique » (0-100). En 'composite' : reçue du contrat.
  // En 'statement' : valeur du score geo_citability (jamais en tête).
  subTechnique?: number | null;
  // Sous-composante « Position concurrentielle » (= geo_score relatif 0-99, PAS
  // un compte). Non-null uniquement en 'composite'.
  subCitations?: number | null;
  // Interprétation du score en langage business (texte par palier, serveur).
  // Remplace l'affichage des 2 sous-scores chiffrés (retour COMEX 2026-08-07).
  interpretation?: string | null;
  // Date de mesure (ISO8601). La carte la formate (« Mesuré le … »). null si absente.
  measuredAt?: string | null;
  userPages: number;
  // Citations brutes du prospect (« cité N fois »). Distinct de subCitations (rang).
  userCitations?: number | null;
  medianPanelPages: number;
  leaderPages: number;
  ratioVsMedian?: number | null;
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
    | "notoriete"
    | "visibility";
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

// ── Score global (agrégat des 4 piliers) ────────────────────────────────────
// Calculé SERVEUR (source unique `computeGlobalScore`) : le front LIT
// { value, band, ready, missing }, il ne recalcule NI la moyenne NI les seuils
// (invariant « 56 vs 12 »). ready=false → carte verrouillée + liste `missing`
// (état d'attente honnête ; JAMAIS de moyenne partielle affichée comme un score
// global). STRICT 4 piliers décidé côté serveur.
export interface GlobalScoreResult {
  value: number | null;
  band: "critical" | "medium" | "good" | null;
  ready: boolean;
  missing: string[];
}

export async function fetchGlobalScore(
  projectId: string,
): Promise<GlobalScoreResult> {
  const res = await apiFetch(`/projects/${projectId}/global-score`);
  if (!res.ok) throw new Error(`global-score ${res.status}`);
  return (await res.json()) as GlobalScoreResult;
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

// Accès des crawlers IA (geo_citability.complementary). Contrat SEO Engine à deux
// familles (livré + vérifié prod 2026-08-04, cf. TICKET-SEO-ENGINE-…-geo-acces-crawler).
export interface AiCrawlerAccess {
  /**
   * Crawlers de RÉPONSE bloqués (OAI-SearchBot, ChatGPT-User, PerplexityBot).
   * Non vide → site RÉELLEMENT non citable par les IA. On NE surface PAS le blocage
   * des crawlers d'ENTRAÎNEMENT (GPTBot, ClaudeBot, Google-Extended, Bytespider) :
   * c'est un choix éditorial sur l'usage du contenu, le site reste citable.
   */
  answerBlocked: string[];
}

// Ne renvoie un caveat QUE pour un blocage RÉELLEMENT pénalisant :
//  1. status === 'checked' : le robots.txt a été lu. unknown (erreur réseau/403) =
//     non vérifié ≠ tous autorisés ; no_robots (404) = site ouvert. Dans ces deux
//     cas, aucune conclusion (absence de mesure n'est pas une mesure à zéro — même
//     doctrine que le score GEO).
//  2. answer_crawlers_blocked non vide : seuls les crawlers de RÉPONSE bloqués
//     rendent le site non citable. L'ancien ai_crawlers_blocked (qui mélangeait les
//     familles) N'EST PLUS lu : il faux-flaggait les sites bloquant l'entraînement.
export function aiCrawlerAccess(
  scores: { scoreType: string; rawData: Record<string, unknown> | null }[],
): AiCrawlerAccess | null {
  const comp = (
    scores.find((s) => s.scoreType === "geo_citability")?.rawData as
      | {
          complementary?: {
            ai_crawlers_status?: unknown;
            answer_crawlers_blocked?: unknown;
          };
        }
      | null
      | undefined
  )?.complementary;
  if (!comp) return null;
  if (comp.ai_crawlers_status !== "checked") return null;
  const answerBlocked = Array.isArray(comp.answer_crawlers_blocked)
    ? comp.answer_crawlers_blocked.filter((x): x is string => typeof x === "string")
    : [];
  if (answerBlocked.length === 0) return null;
  return { answerBlocked };
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
