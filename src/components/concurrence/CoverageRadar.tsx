"use client";

import { useState } from "react";
import { ConcurrenceData } from "./types";

interface Props {
  data: ConcurrenceData;
}

function scoreFromPosition(pos: number | null): number {
  if (pos === null || pos > 10) return 0;
  return 11 - pos;
}

export default function CoverageRadar({ data }: Props) {
  const { brands, keywords, positions } = data;
  const [hovered, setHovered] = useState<string | null>(null);

  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 130;
  const maxScore = 10;

  const angleFor = (i: number) => (i / keywords.length) * Math.PI * 2 - Math.PI / 2;

  // Axes points (one per keyword)
  const axisPoints = keywords.map((_, i) => {
    const a = angleFor(i);
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
  });

  // Gridlines (concentric pentagons at 25/50/75/100%)
  const gridLevels = [0.25, 0.5, 0.75, 1];

  function brandPolygon(bIdx: number): string {
    return keywords
      .map((_, kIdx) => {
        const score = scoreFromPosition(positions[kIdx][bIdx]);
        const ratio = score / maxScore;
        const a = angleFor(kIdx);
        const x = cx + Math.cos(a) * radius * ratio;
        const y = cy + Math.sin(a) * radius * ratio;
        return `${kIdx === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ") + " Z";
  }

  function gridPolygon(level: number): string {
    return axisPoints
      .map(({ x, y }, i) => {
        const gx = cx + (x - cx) * level;
        const gy = cy + (y - cy) * level;
        return `${i === 0 ? "M" : "L"}${gx.toFixed(2)},${gy.toFixed(2)}`;
      })
      .join(" ") + " Z";
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-[360px] w-[360px] max-w-full">
        {/* Grid */}
        {gridLevels.map((l) => (
          <path key={l} d={gridPolygon(l)} fill="none" stroke="var(--border-subtle)" strokeWidth={1} />
        ))}
        {/* Axes */}
        {axisPoints.map(({ x, y }, i) => (
          <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border-subtle)" strokeWidth={1} />
        ))}

        {/* Brand polygons */}
        {brands.map((b, bIdx) => {
          const isHovered = hovered === b.id;
          const isOther = hovered !== null && hovered !== b.id;
          return (
            <path
              key={b.id}
              d={brandPolygon(bIdx)}
              fill={b.fillColor}
              stroke={b.color}
              strokeWidth={isHovered ? 3 : 2}
              opacity={isOther ? 0.15 : 1}
              style={{ transition: "opacity 0.2s var(--ease-out), stroke-width 0.2s var(--ease-out)" }}
            />
          );
        })}

        {/* Axis labels */}
        {keywords.map((kw, i) => {
          const a = angleFor(i);
          const labelR = radius + 18;
          const x = cx + Math.cos(a) * labelR;
          const y = cy + Math.sin(a) * labelR;
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-text-secondary text-[11px] font-medium"
            >
              {kw.label.length > 14 ? kw.label.slice(0, 12) + "…" : kw.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {brands.map((b) => (
          <button
            key={b.id}
            onMouseEnter={() => setHovered(b.id)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-card-inner-bg px-3 py-1 text-[12px] font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
            {b.name}
          </button>
        ))}
      </div>
      <p className="text-center text-[11px] font-light text-text-muted">
        Score = 11 − position. Hors top 10 = 0. Survolez une marque pour la mettre en valeur.
      </p>
    </div>
  );
}
