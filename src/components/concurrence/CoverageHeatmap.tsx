"use client";

import {
  coverageRate,
  getEmptyCellDisplay,
  getPositionTier,
  type Brand,
  type ConcurrenceData,
} from "@/lib/concurrence";

import BrandAvatar from "./BrandAvatar";

interface Props {
  data: ConcurrenceData;
  // Mode dense (rapport PDF) : cellules resserrées.
  compact?: boolean;
}

export default function CoverageHeatmap({ data, compact = false }: Props) {
  const { brands, keywords, positions, sources } = data;
  const cellText = compact ? "text-[11px]" : "text-[14px]";

  // Garde-fou : pas de concurrent mesuré, on affiche une note explicite
  // plutôt que de disparaître silencieusement.
  if (brands.length === 0 || keywords.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-card-inner-bg p-4 text-[13px] font-light text-text-muted">
        Pas assez de concurrents mesurés pour afficher la couverture.
      </div>
    );
  }

  const coverages = brands.map((_: Brand, bIdx: number) =>
    coverageRate(positions.map((row) => row[bIdx])),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-separate border-spacing-x-2 border-spacing-y-2">
        <thead>
          <tr>
            <th className="text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Mot-clé
            </th>
            {brands.map((b: Brand) => (
              <th key={b.id} className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <BrandAvatar brand={b} size={20} textSize="text-[10px]" />
                  <span className="text-[12px] font-medium text-text-secondary">
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
              <td className="text-[13px] font-light text-text-secondary">
                {kw.label}
              </td>
              {brands.map((b: Brand, bIdx: number) => {
                const pos = positions[kIdx][bIdx];
                if (pos !== null) {
                  const tier = getPositionTier(pos);
                  return (
                    <td key={b.id}>
                      <div
                        className={`flex h-10 items-center justify-center rounded-lg ${cellText} font-semibold tabular-nums ${tier.text}`}
                        style={{ background: tier.bg }}
                      >
                        {pos}
                      </div>
                    </td>
                  );
                }
                // Pas de position : "NR" = vraie absence (miss top 100 en
                // mesure temps réel) vs "—" = tracking indisponible.
                // On honore le null, jamais coercé en 0.
                const empty = getEmptyCellDisplay(sources?.[kIdx]?.[bIdx] ?? null);
                return (
                  <td key={b.id}>
                    <div
                      title={empty.title}
                      className={`flex h-10 items-center justify-center rounded-lg ${cellText} font-semibold tabular-nums ${empty.textClass}`}
                      style={{ background: empty.bg }}
                    >
                      {empty.text}
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
            <td className="text-[12px] font-medium uppercase tracking-wider text-text-muted">
              Couverture top 10
            </td>
            {brands.map((b: Brand, bIdx: number) => (
              <td key={b.id} className="text-center">
                <span
                  className="text-[18px] font-bold tabular-nums"
                  style={{ color: b.color }}
                >
                  {coverages[bIdx]}%
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-medium text-text-muted">
        {[
          { label: "Top 3", bg: "rgba(45,212,191,0.25)" },
          { label: "Top 10", bg: "rgba(34,197,94,0.15)" },
          { label: "Top 20", bg: "rgba(245,158,11,0.15)" },
          { label: "21-30", bg: "rgba(249,115,22,0.12)" },
          { label: "30+", bg: "rgba(239,68,68,0.15)" },
          { label: "NR (non positionné)", bg: "rgba(239,68,68,0.15)" },
          // "SERP indisponible" = mesure temps réel absente, on n'invente
          // aucun chiffre estimé (le null reste un null affiché "—").
          { label: "SERP indisponible", bg: "rgba(148,163,184,0.10)" },
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
