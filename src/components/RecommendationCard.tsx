"use client";

import type { Recommendation, Priority } from "@/app/dashboard/rapport/recommendations";

/** Couleurs par priorité (P1 critique → P3 moyen). */
export const PRIORITY_STYLE: Record<Priority, { label: string; chip: string; index: string }> = {
  P1: {
    label: "Prioritaire",
    chip: "border-red-500/20 bg-red-500/10 text-red-400",
    index: "border-red-500/50 bg-red-500/80 text-white",
  },
  P2: {
    label: "Important",
    chip: "border-violet-500/25 bg-violet-500/10 text-violet-300",
    index: "border-violet-500/50 bg-violet-500/80 text-white",
  },
  P3: {
    label: "Moyen",
    chip: "border-blue-600/25 bg-blue-600/10 text-blue-300",
    index: "border-blue-600/50 bg-blue-700/80 text-white",
  },
};

/** Niveau de priorité affiché en barres (charte : rouge élevée, violet moyenne, bleu foncé basse). */
const PRIORITY_LEVEL: Record<Priority, { level: number; label: string; bar: string }> = {
  P1: { level: 3, label: "Élevée", bar: "bg-red-500" },
  P2: { level: 2, label: "Moyenne", bar: "bg-violet-500" },
  P3: { level: 1, label: "Faible", bar: "bg-blue-700" },
};

/** Badge de priorité : 3 barres ascendantes remplies selon le niveau + libellé. */
function PriorityBadge({ priority }: { priority: Priority }) {
  const { level, label, bar } = PRIORITY_LEVEL[priority];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-card-inner-bg px-2.5 py-1 text-[11px] font-medium text-text-secondary">
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[5, 8, 11].map((h, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-[1px] ${i < level ? bar : "bg-white/15"}`}
            style={{ height: h }}
          />
        ))}
      </span>
      <span>Priorité {label.toLowerCase()}</span>
    </span>
  );
}

/**
 * Carte de recommandation au format demandé :
 * - titre = wording marché (phrase claire)
 * - secondaire = observation technique (constat d'audit)
 * - encart gris = action à mener
 */
export default function RecommendationCard({
  rec,
  index,
  delay = 0,
}: {
  rec: Recommendation;
  index?: number;
  delay?: number;
}) {
  const p = PRIORITY_STYLE[rec.priority];

  return (
    <div
      className="animate-fade-up flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-card p-4 backdrop-blur-[6px] transition-colors duration-200 hover:bg-bg-card-hover"
      style={{ animationDelay: `${delay}ms`, transitionTimingFunction: "var(--ease-out)" }}
    >
      {typeof index === "number" && (
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[13px] font-semibold ${p.index}`}>
          {String(index + 1).padStart(2, "0")}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={rec.priority} />
          <span className="inline-flex items-center rounded-full border border-border-subtle bg-card-inner-bg px-2.5 py-1 text-[11px] font-medium text-text-secondary">
            {rec.pillar}
          </span>
        </div>

        {/* Titre = wording marché */}
        <h3 className="text-[15px] font-medium leading-snug text-text-primary">{rec.title}</h3>

        {/* Observation technique */}
        <p className="text-[13px] font-light leading-relaxed text-text-secondary">{rec.observation}</p>

        {/* Action à mener — encart gris */}
        <div className="mt-1 flex items-start gap-2 rounded-lg border border-card-inner-border bg-card-inner-bg px-3.5 py-2.5">
          <svg className="mt-[2px] h-3.5 w-3.5 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          <p className="text-[13px] font-light leading-relaxed text-text-primary">{rec.action}</p>
        </div>
      </div>
    </div>
  );
}
