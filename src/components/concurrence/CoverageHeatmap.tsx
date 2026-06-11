"use client";

import BrandAvatar from "./BrandAvatar";
import { ConcurrenceData, coverageRate, getPositionTier } from "./types";

interface Props {
  data: ConcurrenceData;
  /**
   * Mode compact : utilise des cellules + spacings + paddings réduits
   * pour faire tenir 10 mots-clés sur une page A4 dans le rapport.
   */
  compact?: boolean;
}

export default function CoverageHeatmap({ data, compact = false }: Props) {
  const { brands, keywords, positions } = data;
  const cellHeight = compact ? "h-7" : "h-10";
  const cellTextSize = compact ? "text-[12px]" : "text-[14px]";
  const spacingY = compact ? "border-spacing-y-1" : "border-spacing-y-2";
  const kwTextSize = compact ? "text-[12px]" : "text-[13px]";
  const summaryTextSize = compact ? "text-[16px]" : "text-[18px]";

  const coverages = brands.map((_, bIdx) =>
    coverageRate(positions.map((row) => row[bIdx]))
  );

  // Le tableau prend 100% de son conteneur. Le keyword col garde 30%, les
  // concurrents se partagent les 70% restants à parts égales : plus ils sont
  // nombreux, plus chaque cellule se rétrécit.
  const brandColPct = 70 / brands.length;

  return (
    <div className="overflow-x-auto">
      <table className={`w-full table-fixed border-separate border-spacing-x-2 ${spacingY}`}>
        <colgroup>
          <col style={{ width: "30%" }} />
          {brands.map((b) => (
            <col key={b.id} style={{ width: `${brandColPct}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="text-left text-[12px] font-medium text-text-muted">
              Mot-clé
            </th>
            {brands.map((b) => (
              <th key={b.id} className="px-1 text-center">
                <div className="flex flex-col items-center justify-center gap-1">
                  <BrandAvatar brand={b} size={20} textSize="text-[10px]" />
                  <span className="text-[10px] font-medium leading-tight text-text-secondary">
                    {b.name}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keywords.map((kw, kIdx) => (
            <tr key={kw.label}>
              <td className={`${kwTextSize} font-light text-text-secondary`}>
                <div className="truncate" title={kw.label}>{kw.label}</div>
              </td>
              {brands.map((b, bIdx) => {
                const pos = positions[kIdx][bIdx];
                const tier = getPositionTier(pos);
                return (
                  <td key={b.id}>
                    <div
                      className={`flex ${cellHeight} w-full items-center justify-center rounded-lg ${cellTextSize} font-semibold tabular-nums ${tier.text}`}
                      style={{ background: tier.bg }}
                    >
                      {pos === null ? "-" : pos}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td colSpan={brands.length + 1}>
              <div className="my-1 h-px bg-border-subtle" />
            </td>
          </tr>
          <tr>
            <td className="text-[12px] font-medium text-text-muted">
              Couverture top 10
            </td>
            {brands.map((b, bIdx) => (
              <td key={b.id} className="text-center">
                <span
                  className={`${summaryTextSize} font-bold tabular-nums`}
                  style={{ color: b.color }}
                >
                  {coverages[bIdx]}%
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-medium text-text-muted">
        {[
          { label: "Top 3", bg: "rgba(45,212,191,0.25)" },
          { label: "Top 10", bg: "rgba(34,197,94,0.15)" },
          { label: "Top 20", bg: "rgba(245,158,11,0.15)" },
          { label: "21-30", bg: "rgba(249,115,22,0.12)" },
          { label: "30+", bg: "rgba(239,68,68,0.15)" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: l.bg }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
