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
