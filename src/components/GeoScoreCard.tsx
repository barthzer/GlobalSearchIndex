"use client";

import { useEffect, useState } from "react";
import ScoreInfoModal from "./ScoreInfoModal";
import InsightNote from "./InsightNote";
import { geoScore, geoByModel } from "@/app/dashboard/rapport/scores";

type ScoreInfo = React.ComponentProps<typeof ScoreInfoModal>["info"];

const geoIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
  </svg>
);

function scoreColors(s: number) {
  if (s < 50) return { start: "#ef4444", end: "#f97316" };
  if (s < 75) return { start: "#f97316", end: "#eab308" };
  return { start: "#22c55e", end: "#4ade80" };
}

/**
 * Encart GEO dédié : score de visibilité GEO (même format d'arc que les autres scores)
 * + détail par moteur d'IA. Le « comment c'est calculé » est dans une bulle « i ».
 * Inspiré de Profound "Visibility Score by Platform".
 */
export default function GeoScoreCard({ info, delay = 0 }: { info?: ScoreInfo; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const TOP_N = 4;
  const maxCitations = Math.max(1, ...geoByModel.map((m) => m.citations ?? 0));
  const visibleModels = showAll ? geoByModel : geoByModel.slice(0, TOP_N);
  const hiddenCount = geoByModel.length - TOP_N;

  const radius = 86.33;
  const circumference = Math.PI * radius;
  const offset = circumference - (geoScore / 100) * circumference;
  const col = scoreColors(geoScore);

  return (
    <>
      {showInfo && info && <ScoreInfoModal info={info} icon={geoIcon} onClose={() => setShowInfo(false)} />}
      <div
        className="rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo)",
        }}
      >
        {/* Header */}
        <div className="flex w-full items-center gap-2 px-5 pt-5 md:px-6 md:pt-6">
          <span className="text-text-primary/80">{geoIcon}</span>
          <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Visibilité GEO</span>
          {info && (
            <button
              onClick={() => setShowInfo(true)}
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-card-inner-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
              aria-label="Informations sur le score GEO"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-5 p-5 md:flex-row md:items-center md:gap-8 md:p-6">
          {/* Arc score — même format que les autres scores */}
          <div className="relative shrink-0">
            <svg viewBox="0 0 181 95" className="h-24 w-44">
              <path
                d="M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301"
                fill="none" stroke="var(--arc-bg)" strokeWidth="8" strokeLinecap="round"
              />
              <path
                d="M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301"
                fill="none" stroke="url(#geo-arc-grad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={visible ? offset : circumference}
                style={{ transition: `stroke-dashoffset 1.2s var(--ease-in-out) ${delay}ms` }}
              />
              <defs>
                <linearGradient id="geo-arc-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={col.start} />
                  <stop offset="100%" stopColor={col.end} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-end justify-center">
              <span className="text-3xl font-bold tabular-nums text-text-primary">{geoScore}</span>
              <span className="mb-1 text-sm text-text-muted">/100</span>
            </div>
          </div>

          {/* Détail par IA */}
          <div className="flex w-full flex-1 flex-col gap-3 md:border-l md:border-border-subtle md:pl-8">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium uppercase tracking-wide text-text-muted">Par moteur d&apos;IA</span>
              <span className="text-[11px] font-light text-text-muted">Citations · Pages</span>
            </div>
            {visibleModels.map((m) => {
              const audited = m.citations !== null;
              const barPct = audited ? (m.citations! / maxCitations) * 100 : 0;
              return (
                <div key={m.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-card-inner-bg">
                    {m.logo ? (
                      <img src={m.logo} alt={m.name} className="h-full w-full object-contain p-1" />
                    ) : (
                      <span className="text-[11px] font-semibold text-text-secondary">{m.name[0]}</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-medium text-text-primary">{m.name}</span>
                      {audited ? (
                        <span className="shrink-0 text-[12px] text-text-secondary">
                          <span className="font-semibold text-text-primary">{m.citations}</span>
                          <span className="text-text-muted"> · {m.pages}</span>
                        </span>
                      ) : (
                        <span className="shrink-0 text-[11px] font-light text-text-muted">Non audité</span>
                      )}
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      {audited && (
                        <div
                          className="h-full rounded-full bg-accent-pink"
                          style={{ width: `${barPct}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-1 flex items-center justify-center gap-1.5 self-start rounded-full border border-border-subtle bg-card-inner-bg px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.97]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                {showAll ? "Voir moins" : `Voir les ${hiddenCount} autres moteurs`}
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-200"
                  style={{ transform: showAll ? "rotate(180deg)" : "none" }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Insight */}
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <InsightNote>
            Le score GEO mesure votre visibilité dans les réponses des IA génératives (ChatGPT, Gemini, Perplexity…).{" "}
            <span className="font-medium text-text-primary">Citations</span> = nombre de fois où votre site est cité comme source,{" "}
            <span className="font-medium text-text-primary">Pages</span> = nombre de vos pages distinctes reprises par ces moteurs.
          </InsightNote>
        </div>
      </div>
    </>
  );
}
