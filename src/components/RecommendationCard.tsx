"use client";

import type { Recommendation } from "@/app/dashboard/rapport/recommendations";
import { PRIORITY_STYLE, PriorityBadge, PillarBadge } from "./recoBadges";

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
          <PillarBadge pillar={rec.pillar} />
        </div>

        {/* Titre = wording marché */}
        <h3 className="text-[15px] font-medium leading-snug text-text-primary">{rec.title}</h3>

        {/* Observation technique */}
        <p className="text-[13px] font-light leading-relaxed text-text-secondary">{rec.observation}</p>

        {/* Action à mener — encart gris */}
        <div className="mt-1 rounded-lg border border-card-inner-border bg-card-inner-bg px-3.5 py-2.5">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent-pink">
            Action à mener
          </p>
          <div className="flex items-start gap-2">
            <svg className="mt-[2px] h-3.5 w-3.5 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            <p className="text-[13px] font-light leading-relaxed text-text-primary">{rec.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
