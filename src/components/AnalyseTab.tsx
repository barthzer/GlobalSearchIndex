"use client";

import { useEffect, useState } from "react";
import {
  fetchProjectScores,
  anyProcessing,
  citationsDisplay,
  aiCrawlerAccess,
  type ProjectScore,
  type ScoreDisplay,
} from "@/lib/scores";
import RealScoreArc from "./RealScoreArc";
import { scoreInfos, scoreIcons } from "@/app/dashboard/rapport/score-infos";
import RealPageSpeed from "./RealPageSpeed";
import RealRecommendations from "./RealRecommendations";
import NotWiredNotice from "./NotWiredNotice";
import RealGeoScoreCard, { type PlatformBreakdown } from "./RealGeoScoreCard";
import RealTrafficVisibility from "./RealTrafficVisibility";
import RealNotorieteInsights from "./RealNotorieteInsights";

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
  clientName,
  onExpertClick,
}: {
  projectId: string;
  clientName?: string;
  onExpertClick?: () => void;
}) {
  const [scores, setScores] = useState<ProjectScore[] | null>(null);
  const [error, setError] = useState(false);
  // Bump manuel (déblocage) → recharge immédiate + relance le polling.
  const [reloadCounter, setReloadCounter] = useState(0);
  // Signal de refetch pour les blocs enfants qui ont leur propre fetch
  // (RealNotorieteInsights) : incrémenté à chaque tick, pour que le benchmark
  // cascadé côté serveur (POST /semantic → cascadeNotorieteBenchmark) apparaisse
  // sans reload manuel (invariant POST=repoll).
  const [pollTick, setPollTick] = useState(0);

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
        setPollTick((t) => t + 1);
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
  }, [projectId, reloadCounter]);

  // Après un déblocage (popup sémantique / benchmark / GEO), on recharge tout de
  // suite : semantic + geo_citations passent en processing → bannière + polling
  // démarrent immédiatement, et le benchmark notoriété suit via pollTick.
  const handleUnlocked = () => setReloadCounter((c) => c + 1);

  if (error) {
    return (
      <NotWiredNotice label="Impossible de charger les scores de ce projet, réessayez." />
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
          Analyse en cours. Les scores s&apos;actualisent automatiquement.
        </div>
      )}

      {/* Carte GEO (modèle composite, pattern autorité) — UNE carte, 3 layouts
          décidés SERVEUR (display.geoContext.layout de geo_citations) : verrou /
          composite / constat. La technique (geo_citability) n'a plus d'arc propre :
          elle devient une sous-composante (composite) ou une sous-ligne (constat),
          jamais seule ni en tête. */}
      <div className="mb-4">
        <RealGeoScoreCard
          display={citationsDisplay(scores)}
          status={byType("geo_citations")?.status ?? null}
          crawlerAccess={aiCrawlerAccess(scores)}
          projectId={projectId}
          onUnlocked={handleUnlocked}
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
              // Verrouillé → carte de déblocage. Sémantique : status locked.
              // Autorité : régime absolu (display.absolute) → le /100 relatif se
              // débloque avec les concurrents (même panel que la Sémantique).
              unlockable={
                (type === "semantic" && sc?.status === "locked") ||
                (type === "authority" && display.absolute)
              }
              unlockCtaLabel={
                type === "authority"
                  ? "Débloquer le score relatif"
                  : "Calculer mon score sémantique"
              }
              processing={sc?.status === "processing"}
              projectId={projectId}
              onUnlocked={handleUnlocked}
            />
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
          status={byType("page_speed")?.status ?? null}
        />
      </div>

      {/* Trafic / Indice de visibilité — DEUX sous-onglets (maquette Barth). Trafic
          mensuel (org_traffic MONDE, attend Ahrefs) + Indice de visibilité (Haloscan,
          réel, portable maintenant). Entre PageSpeed et Notoriété. */}
      <div className="mb-6">
        <RealTrafficVisibility
          projectId={projectId}
          score={byType("geo_citations") ?? null}
        />
      </div>

      {/* Notoriété & autorité média — FUSIONNÉE dans l'Analyse (ligne 553 de Barth,
          client + admin). Le prospect voit enfin la donnée qu'on possède : autorité
          composite /100 (serveur), backlinks, grands médias, benchmark. */}
      <div className="mb-6">
        <RealNotorieteInsights
          projectId={projectId}
          clientName={clientName ?? "Vous"}
          onUnlockClick={onExpertClick}
          refreshTick={pollTick}
        />
      </div>

      {/* Recommandations (M4) — la donnée existe, l'endpoint est câblé. */}
      <div className="mt-8">
        <RealRecommendations projectId={projectId} />
      </div>
    </>
  );
}
