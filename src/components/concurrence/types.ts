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

export interface ConcurrenceData {
  brands: Brand[];
  keywords: Keyword[];
  positions: (number | null)[][];
}

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
  if (pos === null) return { bg: "rgba(156,163,175,0.12)", text: "text-text-muted", label: "Non classé" };
  if (pos > 30) return { bg: "rgba(239,68,68,0.15)", text: "text-red-400", label: "30+" };
  if (pos <= 3) return { bg: "rgba(45,212,191,0.25)", text: "text-teal-500", label: "Top 3" };
  if (pos <= 10) return { bg: "rgba(34,197,94,0.15)", text: "text-emerald-400", label: "Top 10" };
  if (pos <= 20) return { bg: "rgba(245,158,11,0.15)", text: "text-amber-400", label: "Top 20" };
  return { bg: "rgba(249,115,22,0.12)", text: "text-orange-400", label: "21-30" };
}

export function coverageRate(positions: (number | null)[]): number {
  const top10 = positions.filter((p) => p !== null && p <= 10).length;
  return Math.round((top10 / positions.length) * 100);
}

export function trafficByBrand(
  positions: (number | null)[][],
  keywords: Keyword[]
): number[] {
  const brandCount = positions[0].length;
  const traffic = new Array(brandCount).fill(0);
  for (let kIdx = 0; kIdx < keywords.length; kIdx++) {
    const vol = keywords[kIdx].volume;
    for (let bIdx = 0; bIdx < brandCount; bIdx++) {
      const pos = positions[kIdx][bIdx];
      traffic[bIdx] += (ctrFromPosition(pos) * vol) / 100;
    }
  }
  return traffic;
}

export function generateCoverageInsight(data: ConcurrenceData): string | null {
  const { brands, keywords, positions } = data;
  if (brands.length < 2) return null;

  const coverages = brands.map((_, bIdx) =>
    coverageRate(positions.map((row) => row[bIdx]))
  );
  const bestIdx = coverages.indexOf(Math.max(...coverages));
  const worstIdx = coverages.indexOf(Math.min(...coverages));
  const winner = brands[bestIdx];
  const winnerCov = coverages[bestIdx];

  // Find best position for winner
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
    return `${winner.name} domine la couverture top 10 avec ${winnerCov}% des mots-clés, dont une position #${bestPos} sur "${bestKwLabel}". Avance de ${gap} points sur le concurrent le moins présent.`;
  }
  return `${winner.name} mène la couverture top 10 avec ${winnerCov}% des mots-clés, soit ${gap} points d'avance sur le concurrent le moins présent.`;
}
