"use client";

import { bandColors } from "./pillar/PillarParts";

// Panneau « Score par pilier » (refonte 3 piliers, 2026-09-03) — repris de la
// maquette Barth (AnalysePage : grille de demi-jauges par pilier). NOS 3 piliers
// consolidés : SEO (composite Technique + Sémantique), GEO, Autorité. Chaque
// cellule est un raccourci cliquable vers le bloc complet (#pilier-*). Le
// CLASSEMENT GSI (rangs/trophées) est OMIS : donnée non produite (décision Kevin).
//
// COULEUR = bande SERVEUR (display.band), jamais un seuil recalculé côté front
// (invariant « 56 vs 12 »). Un pilier sans /100 → jauge verrouillée (jamais un 0).

type Band = "critical" | "medium" | "good";

export interface PillarBar {
  label: string;
  /** Score /100 résolu serveur, ou null (pilier non encore mesurable). */
  value: number | null;
  /** Bande serveur (couleur de la jauge). null si pas de valeur. */
  band: Band | null;
  /** Ancre du bloc complet (scroll-to au clic). */
  anchor: string;
}

const ARC_D = "M8 70 A62 62 0 0 1 132 70";
const ARC_CIRC = Math.PI * 62;

function HalfArc({ value, band }: { value: number; band: Band }) {
  const col = bandColors(band);
  const offset = ARC_CIRC - (value / 100) * ARC_CIRC;
  return (
    <svg viewBox="0 0 140 76" className="h-[56px] w-[104px]">
      <path d={ARC_D} fill="none" stroke="var(--arc-bg)" strokeWidth={6} strokeLinecap="round" />
      <path
        d={ARC_D}
        fill="none"
        stroke={`url(#pillarbar-${band})`}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={ARC_CIRC}
        strokeDashoffset={offset}
      />
      <defs>
        <linearGradient id={`pillarbar-${band}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={col.start} />
          <stop offset="100%" stopColor={col.end} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LockedArc() {
  return (
    <div className="relative">
      <svg viewBox="0 0 140 76" className="h-[56px] w-[104px]">
        <path d={ARC_D} fill="none" stroke="var(--border-subtle)" strokeWidth={6} strokeLinecap="round" strokeDasharray="3 6" />
      </svg>
      <div className="absolute inset-0 flex items-end justify-center pb-0.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle bg-card-inner-bg">
          <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default function PillarScoreBars({ pillars }: { pillars: PillarBar[] }) {
  const scrollTo = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <h3 className="mb-3 px-1 text-[12px] font-medium uppercase tracking-wide text-text-muted">
        Score par pilier
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {pillars.map((p) => {
          const audited = p.value != null && p.band != null;
          return (
            <button
              key={p.anchor}
              type="button"
              onClick={() => scrollTo(p.anchor)}
              className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-card p-4 text-left transition-all duration-200 hover:border-white/10 hover:bg-white/[0.03] active:scale-[0.99]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <div className="min-w-0">
                <div className="truncate text-[14px] font-medium text-text-primary">{p.label}</div>
                <div className="mt-0.5 text-[11px] font-light text-text-muted">
                  {audited ? "Voir le détail" : "Non mesuré"}
                </div>
              </div>
              {audited ? (
                <div className="relative shrink-0">
                  <HalfArc value={p.value!} band={p.band!} />
                  <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                    <span className="text-[20px] font-semibold tabular-nums text-text-primary">{p.value}</span>
                  </div>
                </div>
              ) : (
                <div className="shrink-0">
                  <LockedArc />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
