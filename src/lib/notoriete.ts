import type { ProjectScore } from "./scores";

// Vues M7a dérivées du rawData du score notoriete (backlinks + grands médias).
// Aucun mock : rawData absent → null → l'onglet affiche un état explicite.
export interface BacklinksView {
  total: number;
  domains: number;
  growth: string;
}
export interface MediaView {
  mediasCount: number;
  mentionsCount: number;
  pills: string[];
}

interface NotoRaw {
  backlinks?: {
    total?: number | null;
    ref_domains?: number | null;
    // ref_domains_follow peut arriver null côté SEO Engine → repli sur ref_domains.
    ref_domains_follow?: number | null;
    growth_m1?: number | null;
  } | null;
  medias?: {
    count?: number | null;
    // articles_count = backlinks issus des médias whitelistés (mentions).
    articles_count?: number | null;
    top_pills?: string[] | null;
  } | null;
}

// Formatage croissance identique à apps/web (data.ts) : arrondi %, signe explicite.
function fmtGrowth(g: number): string {
  const pct = Math.round(g * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

export function mapNotoriete(
  raw: Record<string, unknown> | null,
): { backlinks: BacklinksView; medias: MediaView } | null {
  if (!raw) return null;
  const r = raw as NotoRaw;
  const bk = r.backlinks ?? {};
  const m = r.medias ?? {};
  return {
    backlinks: {
      total: bk.total ?? 0,
      domains: bk.ref_domains_follow ?? bk.ref_domains ?? 0,
      growth: fmtGrowth(bk.growth_m1 ?? 0),
    },
    medias: {
      mediasCount: m.count ?? 0,
      mentionsCount: m.articles_count ?? 0,
      pills: m.top_pills ?? [],
    },
  };
}

export const fmtFr = (n: number): string => n.toLocaleString("fr-FR");

// Croissance affichée seulement si non nulle (jamais un « +0% » creux).
export const growthShown = (g: string): boolean =>
  g !== "+0%" && g !== "0%" && g !== "-0%";

// Sélection des scores utiles à l'onglet notoriété.
export function pickNotoriete(scores: ProjectScore[]): {
  noto: ProjectScore | undefined;
  authority: ProjectScore | undefined;
} {
  return {
    noto: scores.find((s) => s.scoreType === "notoriete"),
    authority: scores.find((s) => s.scoreType === "authority"),
  };
}

// ── M7b : Benchmark concurrents ────────────────────────────────────────────
// Portage de la logique de apps/web notoriete-view.tsx. Le benchmark est
// INTERNE (jamais rendu côté prospect) → pas d'enjeu source-unique, on reproduit
// fidèlement apps/web. Invariants durs :
//  - insufficient → retour BAS pur : colonne BAS, rang BAS, LIGNE CLIENT RETIRÉE
//    (sa jauge composite /100 est déjà au-dessus → jamais « 56 vs 12 ») ;
//  - prospect non scoré → « — », hors décompte, rang « X sur N notés » ;
//  - pending → « en cours », jamais un score provisoire.

export interface CompetitorRow {
  name: string;
  domain?: string;
  isYou?: boolean;
  ref_domains?: number | null;
  score: number; // BAS brut
  composite?: number | null; // /100 composite, null = non classé, undefined = en cours
  composite_reason?: "growth_null" | "bas_floor";
  medias?: number | null;
  medias_status?: "processing" | "completed" | "error";
  presence?: string | null;
  media_details?: { media: string; label: string; backlinks: number }[];
  unavailable?: boolean;
  unavailable_reason?: string;
}

type CompositeRank =
  | { kind: "ranked"; rank: number; total: number; hint: string }
  | { kind: "prospect_unscored"; hint: string }
  | { kind: "insufficient"; hint: string };

interface BenchmarkRaw {
  rank?: number;
  total?: number;
  rank_hint?: string;
  competitors?: CompetitorRow[];
  composite_rank?: CompositeRank;
  composite_status?: "pending" | "ready";
}

export interface BenchmarkView {
  unlocked: boolean;
  rows: CompetitorRow[];
  rank: number;
  total: number;
  rankHint: string;
  compositeMode: boolean; // colonne Autorité /100 + ligne client visible
  compositeReady: boolean; // composites fiables (sinon « en cours »)
  compositePending: boolean; // activé mais médias en cours
  compositeUnscored: boolean; // prospect lui-même « — »
}

export function deriveBenchmark(raw: Record<string, unknown> | null): BenchmarkView {
  const empty: BenchmarkView = {
    unlocked: false,
    rows: [],
    rank: 0,
    total: 0,
    rankHint: "",
    compositeMode: false,
    compositeReady: false,
    compositePending: false,
    compositeUnscored: false,
  };
  const b = (raw as { benchmark?: BenchmarkRaw } | null)?.benchmark;
  if (!b || !Array.isArray(b.competitors) || b.competitors.length === 0) {
    return b ? { ...empty, unlocked: true } : empty;
  }

  const compositeRank = b.composite_rank ?? null;
  // flagOn : le composite n'est actif que si composite_status est présent.
  const flagOn = b.composite_status != null;
  const compositePending = flagOn && b.composite_status === "pending";
  const compositeRanked =
    flagOn && b.composite_status === "ready" && compositeRank?.kind === "ranked";
  const compositeUnscored =
    flagOn &&
    b.composite_status === "ready" &&
    compositeRank?.kind === "prospect_unscored";
  // 'insufficient' EXCLU du mode composite → retombe en présentation BAS pure.
  const compositeMode = compositePending || compositeRanked || compositeUnscored;
  const compositeReady = compositeRanked || compositeUnscored;

  // Rang affiché.
  let rank = 0;
  let total = 0;
  let rankHint = "";
  if (compositeRanked && compositeRank?.kind === "ranked") {
    rank = compositeRank.rank;
    total = compositeRank.total;
    rankHint = compositeRank.hint;
  } else if (compositeUnscored && compositeRank) {
    // Prospect « — » : JAMAIS de rang inventé.
    rankHint = compositeRank.hint;
  } else if (compositePending) {
    rankHint = "";
  } else {
    // Mode BAS (flag OFF, ou 'insufficient' → retour BAS pur).
    rank = b.rank ?? 0;
    total = b.total ?? 0;
    rankHint = b.rank_hint ?? "";
  }

  // Ligne client : retirée en mode BAS pur (sa jauge /100 est au-dessus →
  // jamais un BAS brut du client à côté d'une colonne d'une autre nature).
  const rows = compositeMode
    ? b.competitors
    : b.competitors.filter((r) => !r.isYou);

  return {
    unlocked: true,
    rows,
    rank,
    total,
    rankHint,
    compositeMode,
    compositeReady,
    compositePending,
    compositeUnscored,
  };
}
