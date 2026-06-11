"use client";

import { useState } from "react";
import { ConcurrenceData } from "./types";

interface Props {
  data: ConcurrenceData;
}

// Monotone cubic interpolation → Cubic Bézier (smoother than Catmull-Rom, no overshoot)
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    return `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)} L${points[1].x.toFixed(2)},${points[1].y.toFixed(2)}`;
  }

  const n = points.length;
  // Slopes between successive points
  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = []; // tangent slopes
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1].x - points[i].x;
    dy[i] = points[i + 1].y - points[i].y;
  }
  // Initial tangents (Fritsch-Carlson)
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

export default function CoverageBump({ data }: Props) {
  const { brands, keywords, positions } = data;
  const [hovered, setHovered] = useState<string | null>(null);

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
        {/* Y axis lines + labels */}
        {yTicks.map((t) => {
          const y = yFor(t);
          return (
            <g key={t}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="var(--border-subtle)" strokeWidth={0.5} strokeDasharray="2 4" />
              <text x={padX - 8} y={y} dominantBaseline="central" textAnchor="end" className="fill-text-muted text-[11px] font-medium">
                #{t}
              </text>
            </g>
          );
        })}

        {/* X axis labels (keywords) */}
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

        {/* Lines per brand */}
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
                style={{ transition: "stroke-width 0.2s var(--ease-out), opacity 0.2s var(--ease-out)" }}
              />
              {keywords.map((_, i) => {
                const pos = positions[i][bIdx];
                return (
                  <circle
                    key={i}
                    cx={xFor(i)}
                    cy={yFor(pos)}
                    r={isHovered ? 5 : 4}
                    fill={b.color}
                    stroke="var(--bg-card)"
                    strokeWidth={2}
                    style={{ transition: "r 0.2s var(--ease-out)" }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
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
