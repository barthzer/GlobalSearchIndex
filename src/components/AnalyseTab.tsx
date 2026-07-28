"use client";

import { useEffect, useState } from "react";
import {
  fetchProjectScores,
  anyProcessing,
  type ProjectScore,
  type ScoreDisplay,
} from "@/lib/scores";
import RealScoreArc from "./RealScoreArc";
import RealPageSpeed from "./RealPageSpeed";
import RealRecommendations from "./RealRecommendations";
import NotWiredNotice from "./NotWiredNotice";

// Les 4 scores de l'analyse, rendus depuis le display SERVEUR (M3). Les autres
// blocs (PageSpeed, trafic, notoriété, recos) restent explicitement « non câblés »
// jusqu'à leurs jalons — jamais de chiffre factice.
const ARC_SCORES: { type: ProjectScore["scoreType"]; label: string }[] = [
  { type: "seo_technical", label: "SEO Technique" },
  { type: "geo_citability", label: "GEO" },
  { type: "authority", label: "Autorité" },
  { type: "semantic", label: "SEO Sémantique" },
];

function icon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

export default function AnalyseTab({ projectId }: { projectId: string }) {
  const [scores, setScores] = useState<ProjectScore[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function load() {
      try {
        const s = await fetchProjectScores(projectId);
        if (!active) return;
        setScores(s);
        setError(false);
        // Polling tant qu'un score se calcule (l'écran dit que ça travaille).
        if (anyProcessing(s)) timer = setTimeout(load, 3000);
      } catch {
        if (active) setError(true);
      }
    }
    setScores(null);
    setError(false);
    load();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [projectId]);

  if (error) {
    return (
      <NotWiredNotice label="Impossible de charger les scores de ce projet — réessayez." />
    );
  }

  // Loader : l'écran dit que ça travaille (le COMEX ne doit jamais voir un vide).
  if (!scores) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ARC_SCORES.map((s) => (
          <div
            key={s.type}
            className="h-56 animate-pulse rounded-2xl border border-border-subtle bg-bg-card"
          />
        ))}
      </div>
    );
  }

  const byType = (t: ProjectScore["scoreType"]) =>
    scores.find((s) => s.scoreType === t);
  const processing = anyProcessing(scores);

  return (
    <>
      {processing && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent-pink/20 bg-accent-pink/[0.05] px-4 py-2.5 text-[13px] text-text-secondary">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-pink/30 border-t-accent-pink" />
          Analyse en cours — les scores s&apos;actualisent automatiquement.
        </div>
      )}

      <section className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ARC_SCORES.map(({ type, label }) => {
          const sc = byType(type);
          // Score absent → arc « non disponible » (jamais un arc qui disparaît).
          const display: ScoreDisplay = sc
            ? sc.display
            : {
                type: "seo",
                scorable: false,
                value: null,
                absolute: false,
                neutralArc: false,
                tone: "muted",
                label: null,
                message: "Score non disponible pour ce projet.",
                caption: "Non disponible",
              };
          return (
            <RealScoreArc key={type} label={label} icon={icon()} display={display} />
          );
        })}
      </section>

      {/* PageSpeed — toujours affiché : les vraies données, ou « non disponible »
          explicite (crawl dégradé). Jamais un bloc qui disparaît en silence. */}
      <div className="mb-6">
        <RealPageSpeed
          raw={
            (byType("page_speed")?.rawData ?? null) as Parameters<
              typeof RealPageSpeed
            >[0]["raw"]
          }
          reason={byType("page_speed")?.display?.message ?? null}
        />
      </div>

      {/* Recommandations (M4) — la donnée existe, l'endpoint est câblé. */}
      <div className="mt-8">
        <RealRecommendations projectId={projectId} />
      </div>

      {/* Restent explicitement non câblés : trafic mensuel (source Ahrefs non
          tranchée — CGU + courbe mondiale vs snapshot France) et notoriété (M7).
          Jamais un chiffre factice. */}
      <div className="mt-6">
        <NotWiredNotice label="Le trafic mensuel et la notoriété & autorité média" />
      </div>
    </>
  );
}
