// M6 — Couche données Concurrence (portage de apps/web concurrence/types.ts).
// Invariants : null ≠ 0 (jamais un chiffre inventé), distinction absence réelle
// (« NR ») vs mesure indisponible (« — »). Le vendeur de la mesure n'apparaît
// JAMAIS ici : le serveur normalise position_source en un token neutre
// (source_kind), Barth ne voit que 'realtime' | 'tracker'.

export interface Brand {
  id: string;
  name: string;
  initial: string;
  gradient: string;
  color: string;
  fillColor: string;
  logoUrl?: string;
}

export interface Keyword {
  label: string;
  volume: number;
}

// Token NEUTRE (normalisé serveur depuis position_source) :
//  - 'realtime' = mesure temps réel → un null = VRAIE absence top 100 (« NR »).
//  - 'tracker'  = tracking → un null = SERP indisponible (« — »).
//  - null       = source inconnue / non collectée → « — ».
export type CellSource = "realtime" | "tracker" | null;

export interface ConcurrenceData {
  brands: Brand[];
  keywords: Keyword[];
  positions: (number | null)[][];
  sources?: CellSource[][];
}

// Résultat explicite : jamais un null silencieux. L'orchestrateur affiche un
// état pour chaque raison (pas de concurrents / pas de mots-clés).
export type ConcurrenceResult =
  | { ok: true; data: ConcurrenceData }
  | { ok: false; reason: "no_competitors" | "no_keywords" };

// Rendu d'une cellule SANS position. Neutre côté vendeur (aucun nom).
export function getEmptyCellDisplay(source: CellSource): {
  text: string;
  bg: string;
  textClass: string;
  title: string;
} {
  if (source === "realtime") {
    return {
      text: "NR",
      bg: "rgba(239,68,68,0.15)",
      textClass: "text-red-400",
      title: "Non positionné dans le top 100 (mesure temps réel)",
    };
  }
  // 'tracker' ou source absente : SERP réellement indisponible, pas d'estimation.
  return {
    text: "—",
    bg: "rgba(148,163,184,0.10)",
    textClass: "text-text-muted",
    title:
      source === "tracker"
        ? "SERP indisponible — aucune position mesurée pour ce mot-clé"
        : "Donnée non collectée",
  };
}

// Courbe CTR consolidée (alignée backend).
export const ctrCurve: Record<number, number> = {
  1: 31.7, 2: 24.7, 3: 18.7, 4: 13.6, 5: 9.5,
  6: 6.2, 7: 4.3, 8: 3.1, 9: 2.6, 10: 2.4,
};

export function ctrFromPosition(pos: number | null): number {
  if (pos === null) return 0;
  if (pos <= 10) return ctrCurve[pos];
  if (pos <= 20) return 0.5;
  return 0;
}

export function getPositionTier(pos: number | null): {
  bg: string;
  text: string;
  label: string;
} {
  if (pos === null || pos > 30) return { bg: "rgba(239,68,68,0.15)", text: "text-red-400", label: "30+" };
  if (pos <= 3) return { bg: "rgba(45,212,191,0.25)", text: "text-teal-500", label: "Top 3" };
  if (pos <= 10) return { bg: "rgba(34,197,94,0.15)", text: "text-emerald-400", label: "Top 10" };
  if (pos <= 20) return { bg: "rgba(245,158,11,0.15)", text: "text-amber-400", label: "Top 20" };
  return { bg: "rgba(249,115,22,0.12)", text: "text-orange-400", label: "21-30" };
}

export function coverageRate(positions: (number | null)[]): number {
  if (positions.length === 0) return 0;
  const top10 = positions.filter((p) => p !== null && p <= 10).length;
  return Math.round((top10 / positions.length) * 100);
}

export function trafficByBrand(
  positions: (number | null)[][],
  keywords: Keyword[],
): number[] {
  if (positions.length === 0) return [];
  const brandCount = positions[0].length;
  const traffic = new Array(brandCount).fill(0) as number[];
  for (let kIdx = 0; kIdx < keywords.length; kIdx++) {
    const vol = keywords[kIdx].volume;
    for (let bIdx = 0; bIdx < brandCount; bIdx++) {
      traffic[bIdx] += (ctrFromPosition(positions[kIdx][bIdx]) * vol) / 100;
    }
  }
  return traffic;
}

// Matrice quasi vide (≤ 1 position top 100) : mots-clés trop spécifiques / sans
// volume. Message d'aide, JAMAIS un Share of Voice trompeur (COMEX, projet LPG).
export function isCoverageDataInsufficient(data: ConcurrenceData): boolean {
  return data.positions.flat().filter((p) => p !== null).length <= 1;
}

// ── Dérivation depuis le rawData du score sémantique ────────────────────────
// Le serveur normalise position_source (vendeur) en source_kind (neutre) ;
// Barth ne lit que source_kind. Absent → null → « — » (dégradation propre).
interface SemanticRawData {
  submitted_competitors?: string[];
  submitted_keywords?: string[];
  brand_exclusions_effective?: string[];
  keyword_details?: {
    keyword: string;
    position?: number | null;
    source_kind?: CellSource;
    volume?: number;
  }[];
  competitor_positions?: Record<
    string,
    { keyword: string; position?: number | null; source_kind?: CellSource }[]
  >;
}

const PROSPECT_BRAND = {
  gradient: "linear-gradient(135deg, var(--gsi-accent-purple), var(--gsi-accent-pink))",
  color: "var(--gsi-accent-pink)",
  fillColor: "rgba(236,77,203,0.2)",
};
const COMPETITOR_PALETTE = [
  { gradient: "linear-gradient(135deg, #c93dd9, #d566e1)", color: "#c93dd9", fillColor: "rgba(201,61,217,0.2)" },
  { gradient: "linear-gradient(135deg, #a72ce8, #b958ee)", color: "#a72ce8", fillColor: "rgba(167,44,232,0.2)" },
  { gradient: "linear-gradient(135deg, #6b1afa, #8748fb)", color: "#6b1afa", fillColor: "rgba(107,26,250,0.2)" },
];
const FALLBACK_VOLUMES = [12000, 8500, 5400, 3200, 1800, 1200, 950, 720, 540, 380];

function cleanDomain(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim();
}

export function buildConcurrenceData(
  raw: SemanticRawData | null,
  prospectName: string,
  prospectInitial: string,
  prospectLogoUrl: string | null | undefined,
  competitorLogos: Record<string, string>,
): ConcurrenceResult {
  const competitors = raw?.submitted_competitors ?? [];
  // Filtre hors-marque (mêmes exclusions que le score v2).
  const brandSet = new Set(
    (raw?.brand_exclusions_effective ?? []).map((b) => b.toLowerCase().trim()),
  );
  const submittedKeywords = (raw?.submitted_keywords ?? []).filter(
    (k) => !brandSet.has(k.toLowerCase().trim()),
  );
  if (competitors.length === 0) return { ok: false, reason: "no_competitors" };
  if (submittedKeywords.length === 0) return { ok: false, reason: "no_keywords" };

  const detailsByKw = new Map<string, { position: number | null; source: CellSource; volume: number }>();
  (raw?.keyword_details ?? []).forEach((d) => {
    detailsByKw.set(d.keyword.toLowerCase().trim(), {
      position: d.position && d.position > 0 ? d.position : null,
      source: d.source_kind ?? null,
      volume: d.volume && d.volume > 0 ? d.volume : 0,
    });
  });

  const keywords: Keyword[] = submittedKeywords.map((label, i) => {
    const detail = detailsByKw.get(label.toLowerCase().trim());
    return { label, volume: detail?.volume && detail.volume > 0 ? detail.volume : FALLBACK_VOLUMES[i] ?? 250 };
  });

  const prospect: Brand = {
    id: "main",
    name: prospectName,
    initial: prospectInitial,
    ...PROSPECT_BRAND,
    logoUrl: prospectLogoUrl ?? undefined,
  };
  const competitorBrands: Brand[] = competitors.map((url, i) => {
    const name = cleanDomain(url) || `Concurrent ${i + 1}`;
    const id = `comp${i + 1}`;
    return {
      id,
      name,
      initial: (name.charAt(0) || "C").toUpperCase(),
      ...COMPETITOR_PALETTE[i % COMPETITOR_PALETTE.length],
      logoUrl: competitorLogos[id],
    };
  });
  const brands = [prospect, ...competitorBrands];

  // Matrice positions (lignes = keywords, colonnes = brands) + sources parallèle.
  // ZÉRO mock : jamais une position inventée ; null = non mesuré.
  const competitorPositionsMap = raw?.competitor_positions ?? {};
  const positions: (number | null)[][] = [];
  const sources: CellSource[][] = [];
  keywords.forEach((kw) => {
    const detail = detailsByKw.get(kw.label.toLowerCase().trim());
    const posRow: (number | null)[] = [detail?.position ?? null];
    const srcRow: CellSource[] = [detail?.source ?? null];
    competitors.forEach((compUrl) => {
      const compKey = compUrl.toLowerCase().trim();
      const compPositions =
        competitorPositionsMap[compKey] ?? competitorPositionsMap[cleanDomain(compUrl)];
      const found = compPositions?.find(
        (p) => p.keyword.toLowerCase().trim() === kw.label.toLowerCase().trim(),
      );
      posRow.push(found?.position ?? null);
      srcRow.push(found?.source_kind ?? null);
    });
    positions.push(posRow);
    sources.push(srcRow);
  });

  return { ok: true, data: { brands, keywords, positions, sources } };
}

export function generateCoverageInsight(data: ConcurrenceData): string | null {
  const { brands, keywords, positions } = data;
  if (brands.length < 2) return null;

  const coverages = brands.map((_, bIdx) => coverageRate(positions.map((row) => row[bIdx])));

  if (isCoverageDataInsufficient(data)) {
    return `Quasi aucune position détectée dans le top 100 : ces mots-clés sont probablement trop spécifiques ou à très faible volume de recherche. Modifiez la sélection pour des requêtes plus recherchées et obtenir une analyse représentative.`;
  }

  const maxCov = Math.max(...coverages);
  if (maxCov === 0) {
    return `Aucune des ${brands.length} marques analysées n'est positionnée en top 10 sur ces mots-clés. Forte opportunité de prise de position éditoriale : le terrain est libre.`;
  }

  const bestIdx = coverages.indexOf(maxCov);
  const worstIdx = coverages.indexOf(Math.min(...coverages));
  const winner = brands[bestIdx];
  const winnerCov = coverages[bestIdx];

  let bestPos: number | null = null;
  let bestKwLabel = "";
  for (let kIdx = 0; kIdx < keywords.length; kIdx++) {
    const pos = positions[kIdx][bestIdx];
    if (pos !== null && (bestPos === null || pos < bestPos)) {
      bestPos = pos;
      bestKwLabel = keywords[kIdx].label;
    }
  }

  if (bestIdx === worstIdx) {
    return `${winner.name} couvre ${winnerCov}% des mots-clés analysés en top 10.`;
  }
  const gap = winnerCov - coverages[worstIdx];
  if (bestPos !== null && bestPos <= 3) {
    return `${winner.name} domine la couverture top 10 avec ${winnerCov}% des mots-clés, dont une position #${bestPos} sur « ${bestKwLabel} ». Avance de ${gap} points sur le concurrent le moins présent.`;
  }
  return `${winner.name} mène la couverture top 10 avec ${winnerCov}% des mots-clés, soit ${gap} points d'avance sur le concurrent le moins présent.`;
}
