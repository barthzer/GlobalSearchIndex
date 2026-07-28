"use client";

import { useState } from "react";
import {
  type ConcurrenceData,
  getEmptyCellDisplay,
} from "@/lib/concurrence";

interface Props {
  data: ConcurrenceData;
}

// Interpolation cubique monotone (Fritsch-Carlson) → courbes lisses sans overshoot
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    return `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)} L${points[1].x.toFixed(2)},${points[1].y.toFixed(2)}`;
  }

  const n = points.length;
  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = []; // pentes tangentes
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1].x - points[i].x;
    dy[i] = points[i + 1].y - points[i].y;
  }
  m[0] = dy[0] / dx[0];
  for (let i = 1; i < n - 1; i++) {
    const slopePrev = dy[i - 1] / dx[i - 1];
    const slopeNext = dy[i] / dx[i];
    m[i] = (slopePrev + slopeNext) / 2;
    if (slopePrev * slopeNext <= 0) m[i] = 0;
  }
  m[n - 1] = dy[n - 2] / dx[n - 2];

  let d = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const x0 = points[i].x;
    const y0 = points[i].y;
    const x1 = points[i + 1].x;
    const y1 = points[i + 1].y;
    const cp1x = x0 + dx[i] / 3;
    const cp1y = y0 + (m[i] * dx[i]) / 3;
    const cp2x = x1 - dx[i] / 3;
    const cp2y = y1 - (m[i + 1] * dx[i]) / 3;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)}`;
  }
  return d;
}

/** État inline explicite quand le graphe ne peut pas s'afficher (jamais d'affichage vide). */
function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full items-center justify-center rounded-lg border border-border-subtle bg-card-inner-bg px-4 py-8 text-center text-[13px] font-light text-text-muted">
      {children}
    </div>
  );
}

export default function CoverageBump({ data }: Props) {
  const { brands, keywords, positions, sources } = data;
  const [hovered, setHovered] = useState<string | null>(null);

  // États insuffisants rendus explicitement — pas de disparition silencieuse.
  if (brands.length === 0) {
    return <EmptyNote>Pas assez de concurrents mesurés</EmptyNote>;
  }
  if (keywords.length === 0) {
    return <EmptyNote>Aucun mot-clé mesuré pour tracer les positions</EmptyNote>;
  }

  const width = 960;
  const height = 360;
  const padX = 60;
  const padY = 40;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const maxPos = 30;
  const xFor = (i: number) =>
    keywords.length === 1 ? padX + innerW / 2 : padX + (i / (keywords.length - 1)) * innerW;
  const yFor = (pos: number | null) => {
    // Une position null (hors top 100 ou tracking indisponible) se projette sur
    // le plancher du graphe : on n'invente jamais une valeur numérique.
    const p = pos === null || pos > maxPos ? maxPos : pos;
    return padY + ((p - 1) / (maxPos - 1)) * innerH;
  };

  const yTicks = [1, 5, 10, 15, 20, 30];

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: "auto" }}
      >
        {/* Axe Y : lignes + libellés */}
        {yTicks.map((t) => {
          const y = yFor(t);
          return (
            <g key={t}>
              <line
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="var(--border-subtle)"
                strokeWidth={0.5}
                strokeDasharray="2 4"
              />
              <text
                x={padX - 8}
                y={y}
                dominantBaseline="central"
                textAnchor="end"
                className="fill-text-muted text-[11px] font-medium"
              >
                #{t}
              </text>
            </g>
          );
        })}

        {/* Axe X : mots-clés */}
        {keywords.map((kw, i) => (
          <text
            key={i}
            x={xFor(i)}
            y={height - padY + 22}
            textAnchor="middle"
            className="fill-text-secondary text-[11px] font-medium"
          >
            {kw.label.length > 12 ? kw.label.slice(0, 10) + "…" : kw.label}
          </text>
        ))}

        {/* Une courbe par marque */}
        {brands.map((b, bIdx) => {
          const isHovered = hovered === b.id;
          const isOther = hovered !== null && hovered !== b.id;
          const points = keywords.map((_, i) => ({
            x: xFor(i),
            y: yFor(positions[i][bIdx]),
          }));
          const path = smoothPath(points);

          return (
            <g
              key={b.id}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
              opacity={isOther ? 0.25 : 1}
            >
              <path
                d={path}
                fill="none"
                stroke={b.color}
                strokeWidth={isHovered ? 3.5 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition:
                    "stroke-width 0.2s var(--ease-out), opacity 0.2s var(--ease-out)",
                }}
              />
              {keywords.map((_, i) => {
                const pos = positions[i][bIdx];
                // Un point null (absence réelle top 100, ou mesure indisponible)
                // reste posé sur le plancher, marqué visuellement en vide.
                const isMissing = pos === null;
                const source = sources?.[i]?.[bIdx] ?? null;
                const missing = getEmptyCellDisplay(source);
                return (
                  <circle
                    key={i}
                    cx={xFor(i)}
                    cy={yFor(pos)}
                    r={isHovered ? 5 : 4}
                    fill={isMissing ? "var(--bg-card)" : b.color}
                    stroke={b.color}
                    strokeWidth={2}
                    strokeDasharray={isMissing ? "2 2" : undefined}
                    style={{ transition: "r 0.2s var(--ease-out)" }}
                  >
                    {isMissing ? <title>{missing.title}</title> : null}
                  </circle>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Légende */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {brands.map((b) => {
          const isActive = hovered === b.id;
          const isOther = hovered !== null && hovered !== b.id;
          return (
            <button
              key={b.id}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-all duration-200 ${
                isActive
                  ? "border-border-badge bg-bg-card-hover text-text-primary"
                  : "border-border-subtle bg-card-inner-bg text-text-secondary hover:text-text-primary"
              }`}
              style={{
                opacity: isOther ? 0.35 : 1,
                transitionTimingFunction: "var(--ease-out)",
              }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
              {b.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
