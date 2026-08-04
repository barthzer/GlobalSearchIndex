"use client";

import { useEffect, useState } from "react";
import {
  fetchProjectScores,
  anyProcessing,
  readabilityDisplay,
  citationsDisplay,
  type ProjectScore,
  type ScoreDisplay,
} from "@/lib/scores";
import RealScoreArc from "./RealScoreArc";
import { scoreInfos, scoreIcons } from "@/app/dashboard/rapport/score-infos";
import RealPageSpeed from "./RealPageSpeed";
import RealRecommendations from "./RealRecommendations";
import NotWiredNotice from "./NotWiredNotice";
import RealGeoScoreCard, { type PlatformBreakdown } from "./RealGeoScoreCard";
import CitationsSection from "./CitationsSection";
import RealTrafficCard from "./RealTrafficCard";

// Les 4 scores de l'analyse, rendus depuis le display SERVEUR (M3). Les autres
// blocs (PageSpeed, trafic, notoriété, recos) restent explicitement « non câblés »
// jusqu'à leurs jalons — jamais de chiffre factice.
// Le bloc GEO est désormais le PILIER IA (deux arcs : Lisibilité geo_citability +
// Citations geo_citations). Il est rendu à part, PAS dans cette grille d'arcs
// simples. Les autres scores restent inchangés.
// Ordre + icônes + bulle info repris de la maquette Barthélemy (Technique,
// Sémantique, Autorité). Le pilier GEO/Citations est rendu à part.
const ARC_SCORES: {
  type: ProjectScore["scoreType"];
  label: string;
  key: "technique" | "semantique" | "autorite";
}[] = [
  { type: "seo_technical", label: "SEO Technique", key: "technique" },
  { type: "semantic", label: "SEO Sémantique", key: "semantique" },
  { type: "authority", label: "Autorité", key: "autorite" },
];

export default function AnalyseTab({
  projectId,
  onExpertClick,
}: {
  projectId: string;
  onExpertClick?: () => void;
}) {
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
  // 3 arcs simples + le pilier IA (2 arcs) → 5 cellules skeleton.
  if (!scores) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ARC_SCORES.map((s) => (
            <div
              key={s.type}
              className="h-56 animate-pulse rounded-2xl border border-border-subtle bg-bg-card"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-56 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
          <div className="h-56 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
        </div>
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

      {/* Encart GEO (design Barth) — arc Lisibilité (geo_citability) + détail par
          moteur d'IA depuis le platform_breakdown RÉEL de geo_citations. Au-dessus
          des arcs, comme la maquette. */}
      <div className="mb-4">
        <RealGeoScoreCard
          display={readabilityDisplay(scores)}
          platformBreakdown={
            (
              byType("geo_citations")?.rawData as
                | { details?: { platform_breakdown?: PlatformBreakdown } }
                | null
            )?.details?.platform_breakdown ?? null
          }
          unavailable={
            (byType("geo_citations")?.rawData as { geo_status?: string } | null)
              ?.geo_status === "unavailable"
          }
        />
      </div>

      <section className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ARC_SCORES.map(({ type, label, key }, i) => {
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
                band: null,
                label: null,
                message: "Score non disponible pour ce projet.",
                caption: "Non disponible",
              };
          return (
            <RealScoreArc
              key={type}
              label={label}
              icon={scoreIcons[key]}
              display={display}
              info={scoreInfos[key]}
              delay={420 + i * 120}
              // Sémantique verrouillé → carte de déblocage (au lieu du non-scorable).
              unlockable={type === "semantic" && sc?.status === "locked"}
              processing={sc?.status === "processing"}
              projectId={projectId}
            />
          );
        })}
      </section>

      {/* Citations par les IA — mesure RELATIVE au panel (vs concurrents). Complète
          l'encart GEO (par-moteur) : dernier bloc du haut de l'Analyse. Verrouillé →
          appel à débloquer l'analyse concurrentielle. */}
      <div className="mb-6">
        <CitationsSection
          geoCitations={citationsDisplay(scores)}
          projectId={projectId}
          onExpertClick={onExpertClick}
        />
      </div>

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
          status={byType("page_speed")?.status ?? null}
        />
      </div>

      {/* Trafic mensuel — courbe org_traffic (MONDE) portée par geo_citations.
          Entre PageSpeed et Recommandations (position maquette). STATUS-aware :
          jamais un vide silencieux (locked → « après déblocage », processing →
          « en cours », completed → courbe ou état honnête). */}
      <div className="mb-6">
        <RealTrafficCard score={byType("geo_citations") ?? null} />
      </div>

      {/* Recommandations (M4) — la donnée existe, l'endpoint est câblé. */}
      <div className="mt-8">
        <RealRecommendations projectId={projectId} />
      </div>
    </>
  );
}
