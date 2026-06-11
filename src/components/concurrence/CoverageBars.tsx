"use client";

import { useEffect, useState } from "react";
import BrandAvatar from "./BrandAvatar";
import { ConcurrenceData, coverageRate } from "./types";

interface Props {
  data: ConcurrenceData;
}

export default function CoverageBars({ data }: Props) {
  const { brands, positions } = data;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  const rows = brands
    .map((b, bIdx) => ({
      brand: b,
      coverage: coverageRate(positions.map((row) => row[bIdx])),
    }))
    .sort((a, b) => b.coverage - a.coverage);

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, idx) => (
        <div key={row.brand.id} className="flex items-center gap-4">
          <div className="flex w-44 shrink-0 items-center gap-2">
            <BrandAvatar brand={row.brand} size={24} textSize="text-[11px]" />
            <span className="truncate text-[14px] font-medium text-text-primary">
              {row.brand.name}
            </span>
          </div>
          <div className="relative h-9 flex-1 overflow-hidden rounded-lg bg-card-inner-bg">
            <div
              className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700"
              style={{
                width: animated ? `${row.coverage}%` : "0%",
                background: row.brand.color,
                opacity: 0.85,
                transitionTimingFunction: "var(--ease-out)",
                transitionDelay: `${idx * 80}ms`,
              }}
            />
          </div>
          <span
            className="w-14 shrink-0 text-right text-[16px] font-bold tabular-nums"
            style={{ color: row.brand.color }}
          >
            {row.coverage}%
          </span>
        </div>
      ))}
    </div>
  );
}
