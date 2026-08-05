// Mapper Notoriété — NOS données réelles (raw_data du score notoriété, BABBAR,
// zéro Ahrefs) → view-models des composants de Barth (AuthorityGauge/BacklinksCard/
// MajorMediaCard) + le benchmark concurrents interne (BenchmarkView, riche).
//
// RECONSTRUIT après la perte /tmp du 2026-08-04 (contrat dérivé de BenchmarkSection
// survivant + structure raw_data réelle vérifiée sur Comundi). Le score composite
// /100 de l'AuthorityGauge vient du SERVEUR (buildScoreDisplay → display.value),
// jamais recalculé ici (source unique).

/** Format nombre FR (séparateur milliers), ex 37494 → « 37 494 ». */
export function fmtFr(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

/** Croissance backlinks (ratio) → « +9 % » / « −3 % » / « — » si null. */
export function fmtGrowth(ratio: number | null | undefined): string {
  if (ratio == null) return "—";
  const pct = Math.round(ratio * 100);
  return `${pct >= 0 ? "+" : ""}${pct} %`;
}

// ── Détail média d'un concurrent (chip « Le Figaro · 12 ») ──────────────────
export interface MediaDetail {
  media: string;
  label: string;
  backlinks: number;
}

// ── Ligne de benchmark concurrents (view interne riche) ─────────────────────
export interface CompetitorRow {
  isYou?: boolean;
  domain?: string | null;
  name: string;
  /** Domaine non mesurable/non indexé → ligne dégradée explicite. */
  unavailable?: boolean;
  unavailable_reason?: "insufficient" | "not_measured" | "not_indexed" | string;
  medias: number | null;
  medias_status?: "processing" | "error" | null;
  media_details?: MediaDetail[];
  ref_domains?: number | null;
  /** Autorité composite /100 (serveur). undefined = en cours, null = non classé. */
  composite?: number | null;
  composite_reason?: "growth_null" | "bas_floor";
  /** Indice BAS (échelle absolue) — affiché en appui du composite. */
  score: number;
}

export interface BenchmarkView {
  unlocked: boolean;
  rows: CompetitorRow[];
  rank: number;
  total: number;
  rankHint: string;
  compositeMode: boolean;
  compositeReady: boolean;
  compositePending: boolean;
  compositeUnscored: boolean;
  basFallbackReason?: string | null;
}

// ── View-models des cards de Barth (props exactes de ses composants) ────────
export interface BacklinksData {
  total: number;
  medias: number;
  domains: number;
  growth: string;
}
export interface MajorMediaData {
  mediasCount: number;
  articlesCount: number;
  pills: string[];
}

// ── Sous-ensemble du raw_data du score notoriété qu'on consomme ─────────────
export interface NotorieteRaw {
  authority?: { bas?: number | null } | null;
  backlinks?: {
    total?: number | null;
    ref_domains?: number | null;
    media_links_count?: number | null;
    growth_m1?: number | null;
  } | null;
  medias?: {
    count?: number | null;
    articles_count?: number | null;
    top_pills?: string[] | null;
  } | null;
  // Plan éditorial (marronniers du secteur) — présent si SEO Engine l'a calculé.
  // Prospect-facing (il est dans le PDF partagé) → affiché à l'écran en parité.
  editorial_plan?: {
    marronniers_subtitle?: string | null;
    slots?: Array<{
      month: string;
      tag: string;
      title: string;
      description: string;
      media_label: string;
      media_subtitle?: string | null;
    }> | null;
  } | null;
  // Benchmark relatif : présent seulement si des concurrents ont été saisis.
  // 🔴 Le serveur (contrat @gsi/shared NotorieteBenchmark) stocke `competitors` +
  // `rank_hint`. On garde `rows`/`hint` en tolérance (données legacy / reconstruction
  // /tmp du 04/08 qui avait introduit le mismatch → benchmark jamais débloqué).
  benchmark?: {
    rank?: number | null;
    total?: number | null;
    competitors?: CompetitorRow[] | null;
    rank_hint?: string | null;
    rows?: CompetitorRow[] | null;
    hint?: string | null;
  } | null;
}

/** BacklinksCard (Barth) ← backlinks réels. */
export function backlinksView(raw: NotorieteRaw | null | undefined): BacklinksData {
  const b = raw?.backlinks ?? {};
  return {
    total: b.total ?? 0,
    medias: b.media_links_count ?? 0,
    domains: b.ref_domains ?? 0,
    growth: fmtGrowth(b.growth_m1),
  };
}

/** MajorMediaCard (Barth) ← grands médias réels. */
export function mediaView(raw: NotorieteRaw | null | undefined): MajorMediaData {
  const m = raw?.medias ?? {};
  return {
    mediasCount: m.count ?? 0,
    articlesCount: m.articles_count ?? 0,
    pills: Array.isArray(m.top_pills) ? m.top_pills : [],
  };
}

/**
 * BenchmarkView ← benchmark réel, ou état VERROUILLÉ si pas de concurrents saisis
 * (cas Comundi). Le déblocage complet (composites par concurrent) est câblé quand
 * `benchmark.rows` est fourni par le back ; sinon `unlocked=false` (read-only).
 */
export function benchmarkView(raw: NotorieteRaw | null | undefined): BenchmarkView {
  const bench = raw?.benchmark ?? null;
  // Contrat serveur = `competitors` ; `rows` = tolérance legacy (mismatch 04/08).
  const rows = Array.isArray(bench?.competitors)
    ? bench!.competitors!
    : Array.isArray(bench?.rows)
      ? bench!.rows!
      : [];
  const unlocked = bench != null && rows.length > 0;
  return {
    unlocked,
    rows,
    rank: bench?.rank ?? 0,
    total: bench?.total ?? 0,
    rankHint: bench?.rank_hint ?? bench?.hint ?? "",
    compositeMode: true,
    compositeReady: unlocked,
    compositePending: false,
    compositeUnscored: false,
    basFallbackReason: null,
  };
}
