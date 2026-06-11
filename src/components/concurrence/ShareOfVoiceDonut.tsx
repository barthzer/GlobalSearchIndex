"use client";

import { useState } from "react";
import BrandAvatar from "./BrandAvatar";
import RankTrophy from "../RankTrophy";
import { ConcurrenceData, trafficByBrand, ctrFromPosition, coverageRate } from "./types";

interface Props {
  data: ConcurrenceData;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR");
}

function generateInsight(data: ConcurrenceData, shares: number[]): string | null {
  const { brands, keywords, positions } = data;
  if (brands.length < 2) return null;

  const coverages = brands.map((_, bIdx) =>
    coverageRate(positions.map((row) => row[bIdx]))
  );

  const bestCoverageIdx = coverages.indexOf(Math.max(...coverages));
  const bestSoVIdx = shares.indexOf(Math.max(...shares));

  // Find the strongest position × volume combo for the SoV leader
  let topKwIdx = -1;
  let topScore = 0;
  keywords.forEach((kw, kIdx) => {
    const pos = positions[kIdx][bestSoVIdx];
    if (pos === null) return;
    const score = ctrFromPosition(pos) * kw.volume;
    if (score > topScore) {
      topScore = score;
      topKwIdx = kIdx;
    }
  });

  if (bestCoverageIdx === bestSoVIdx) {
    // Same brand dominates both
    const brand = brands[bestSoVIdx];
    return `${brand.name} domine cette analyse avec ${coverages[bestSoVIdx]}% de couverture top 10 et ${shares[bestSoVIdx].toFixed(1)}% de la part de voix.`;
  }

  const winner = brands[bestCoverageIdx];
  const sovLeader = brands[bestSoVIdx];
  const topPos = topKwIdx >= 0 ? positions[topKwIdx][bestSoVIdx] : null;
  const topKwLabel = topKwIdx >= 0 ? keywords[topKwIdx].label : "";

  if (topPos !== null && topKwIdx >= 0) {
    return `${winner.name} a la meilleure couverture (${coverages[bestCoverageIdx]}%) mais ${sovLeader.name} capte ${shares[bestSoVIdx].toFixed(1)}% de la part de voix grâce à sa position #${topPos} sur "${topKwLabel}", un mot-clé à fort volume.`;
  }
  return `${winner.name} a la meilleure couverture (${coverages[bestCoverageIdx]}%) mais ${sovLeader.name} capte ${shares[bestSoVIdx].toFixed(1)}% de la part de voix.`;
}

export default function ShareOfVoiceDonut({ data }: Props) {
  const { brands, keywords, positions } = data;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const traffic = trafficByBrand(positions, keywords);
  const total = traffic.reduce((s, t) => s + t, 0) || 1;
  const shares = traffic.map((t) => (t / total) * 100);

  // Sort by share descending for legend
  const sorted = brands
    .map((b, i) => ({ brand: b, share: shares[i], traffic: traffic[i], idx: i }))
    .sort((a, b) => b.share - a.share);

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 90;
  const sw = 12;
  const c = 2 * Math.PI * r;

  // Gap visuel + compensation de l'arrondi (strokeLinecap="round" déborde de sw/2 de chaque côté)
  const visualGap = 6;
  const gapTotal = visualGap + sw; // longueur d'arc à réserver
  let cumulative = 0;
  const arcs = brands.map((b, i) => {
    const share = shares[i] / 100;
    const fullArcLen = share * c;
    const visibleLen = Math.max(0, fullArcLen - gapTotal);
    const rotation = cumulative * 360 + (gapTotal / c) * 180;
    cumulative += share;
    return {
      brand: b,
      share: shares[i],
      visibleLen,
      rotation,
      idx: i,
    };
  });

  const focusIdx = hoveredIdx ?? expandedIdx;
  const focusBrand = focusIdx !== null ? brands[focusIdx] : null;

  function detailFor(brandIdx: number) {
    return keywords.map((kw, kIdx) => {
      const pos = positions[kIdx][brandIdx];
      return {
        kw,
        pos,
        clicks: (ctrFromPosition(pos) * kw.volume) / 100,
      };
    });
  }

  const insight = generateInsight(data, shares);

  return (
    <div className="flex flex-col gap-6"><div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {arcs.map((a) => {
            const isFocused = focusIdx === a.idx;
            const isOther = focusIdx !== null && focusIdx !== a.idx;
            return (
              <circle
                key={a.brand.id}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={a.brand.color}
                strokeWidth={isFocused ? sw + 4 : sw}
                strokeLinecap="round"
                strokeDasharray={`${a.visibleLen} ${c - a.visibleLen}`}
                strokeDashoffset={0}
                opacity={isOther ? 0.3 : 1}
                style={{
                  transform: `rotate(${a.rotation}deg)`,
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: "stroke-dasharray 0.8s var(--ease-out), opacity 0.2s var(--ease-out), stroke-width 0.2s var(--ease-out)",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredIdx(a.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() =>
                  setExpandedIdx(expandedIdx === a.idx ? null : a.idx)
                }
              />
            );
          })}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            {focusBrand ? focusBrand.name.split(" ")[0] : "Total clics"}
          </span>
          <span className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
            {focusIdx !== null ? `${shares[focusIdx].toFixed(1)}%` : fmt(total)}
          </span>
          <span className="text-[11px] font-light text-text-muted">
            {focusIdx !== null ? `~${fmt(traffic[focusIdx])} clics/mois` : "estimés/mois"}
          </span>
        </div>
      </div>

      {/* Legend — accordéon au clic */}
      <div className="flex w-full flex-1 flex-col gap-2">
        {sorted.map((row, rankIdx) => {
          const isExpanded = expandedIdx === row.idx;
          const detail = isExpanded ? detailFor(row.idx) : null;
          return (
            <div
              key={row.brand.id}
              className={`overflow-hidden rounded-xl border transition-colors duration-150 ${
                isExpanded
                  ? "border-border-badge bg-bg-card-hover"
                  : "border-border-subtle bg-card-inner-bg"
              }`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <button
                onClick={() =>
                  setExpandedIdx(isExpanded ? null : row.idx)
                }
                onMouseEnter={() => setHoveredIdx(row.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-bg-card-hover"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: row.brand.color }} />
                <BrandAvatar brand={row.brand} size={24} textSize="text-[11px]" />
                <span className="flex flex-1 items-center gap-2 text-[14px] font-medium text-text-primary">
                  {row.brand.name}
                  <RankTrophy rank={rankIdx + 1} size={18} />
                </span>
                <span className="text-[11px] font-light text-text-muted tabular-nums">
                  ~{fmt(row.traffic)} clics
                </span>
                <span
                  className="text-[16px] font-bold tabular-nums"
                  style={{ color: row.brand.color }}
                >
                  {row.share.toFixed(1)}%
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {isExpanded && detail && (
                <div
                  className="border-t border-border-subtle px-4 py-3"
                  style={{ animation: "fade-up 200ms var(--ease-out) both" }}
                >
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    Détail par mot-clé
                  </p>
                  <div className="flex flex-col gap-1">
                    {detail.map((d, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-border-subtle/50 py-1.5 last:border-b-0">
                        <span className="text-[12px] font-light text-text-secondary">
                          {d.kw.label}
                        </span>
                        <span className="flex items-center gap-3 text-[12px]">
                          <span className="text-text-muted">
                            {d.pos === null ? "-" : `#${d.pos}`}
                          </span>
                          <span className="font-semibold tabular-nums text-text-primary">
                            ~{fmt(d.clicks)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>

      {/* Insight stratégique */}
      {insight && (
        <div className="flex items-start gap-3 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
          </svg>
          <p className="text-[length:var(--text-body)] font-light leading-relaxed text-text-primary">
            {insight}
          </p>
        </div>
      )}
    </div>
  );
}
