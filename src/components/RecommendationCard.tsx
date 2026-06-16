"use client";

import type { Recommendation, Priority, Pillar } from "@/app/dashboard/rapport/recommendations";

/** Code couleur + icône par pilier pour différencier les cartes. */
const PILLAR_STYLE: Record<Pillar, { chip: string; icon: string }> = {
  "SEO Technique": {
    chip: "border-sky-500/40 bg-sky-500/10 text-sky-500",
    icon: "M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5",
  },
  "SEO Sémantique": {
    chip: "border-accent-pink/40 bg-accent-pink/10 text-accent-pink",
    icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
  },
  GEO: {
    chip: "border-violet-500/40 bg-violet-500/10 text-violet-500",
    icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z",
  },
  "Autorité": {
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    icon: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244",
  },
};

/** Pastille de pilier colorée + icône. */
function PillarBadge({ pillar }: { pillar: Pillar }) {
  const s = PILLAR_STYLE[pillar];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${s.chip}`}>
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
      </svg>
      {pillar}
    </span>
  );
}

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
            className={`w-[3px] rounded-[1px] ${i < level ? bar : "bg-text-secondary/40"}`}
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
