"use client";

import { useEffect, useState } from "react";
import {
  fetchProjectScores,
  fetchGlobalScore,
  anyProcessing,
  citationsDisplay,
  aiCrawlerAccess,
  type ProjectScore,
  type GlobalScoreResult,
  type SeoCompositeResult,
} from "@/lib/scores";
import { fetchSemanticAdjustmentsRemaining } from "@/lib/api";
import RealGlobalScoreCard from "./RealGlobalScoreCard";
import RealSeoScoreCard from "./RealSeoScoreCard";
import { scoreInfos } from "@/app/dashboard/rapport/score-infos";
import RealPageSpeed from "./RealPageSpeed";
import RealRecommendations from "./RealRecommendations";
import NotWiredNotice from "./NotWiredNotice";
import RealGeoScoreCard, { type PlatformBreakdown } from "./RealGeoScoreCard";
import RealTrafficVisibility from "./RealTrafficVisibility";
import RealNotorieteInsights from "./RealNotorieteInsights";

// Refonte 3 piliers (2026-09-03) : l'analyse s'articule en 3 blocs consolidés —
// SEO (Technique + Sémantique fusionnés dans RealSeoScoreCard, avec PageSpeed et
// Trafic en slots), GEO/Citabilité IA (RealGeoScoreCard), Autorité (RealNotorieteInsights).
// Fini la grille d'arcs simples : chaque pilier est un bloc à part entière. Les
// scores sont rendus depuis le display SERVEUR (jamais de chiffre recalculé côté front).

export default function AnalyseTab({
  projectId,
  clientName,
  onExpertClick,
  onSeeAllRecos,
}: {
  projectId: string;
  clientName?: string;
  onExpertClick?: () => void;
  /** CTA « voir tout » de l'aperçu recos → bascule vers l'onglet Recommandations. */
  onSeeAllRecos?: () => void;
}) {
  const [scores, setScores] = useState<ProjectScore[] | null>(null);
  // Score global = agrégat SERVEUR des 4 piliers (source unique). Fetché en même
  // temps que les scores pour rester synchrone au polling (jamais un global périmé
  // face aux arcs).
  const [globalScore, setGlobalScore] = useState<GlobalScoreResult | null>(null);
  // Score SEO composite (moyenne Technique + Sémantique) SERVEUR, exposé par
  // /global-score (`.seo`). L'en-tête du bloc SEO le LIT, il ne recalcule pas.
  const [seoComposite, setSeoComposite] = useState<SeoCompositeResult | null>(null);
  // Ajustements sémantiques restants (prospect, cap 2 ; null = commercial illimité).
  const [adjustmentsRemaining, setAdjustmentsRemaining] = useState<number | null>(null);
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
        // Scores + score global en parallèle (même cycle → jamais désynchronisés).
        // Le global est SERVEUR : le front le lit, il ne recalcule pas la moyenne.
        const [s, g, adj] = await Promise.all([
          fetchProjectScores(projectId),
          fetchGlobalScore(projectId).catch(() => null),
          fetchSemanticAdjustmentsRemaining(projectId).catch(() => null),
        ]);
        if (!active) return;
        setScores(s);
        setGlobalScore(g);
        setSeoComposite(g?.seo ?? null);
        setAdjustmentsRemaining(adj);
        setError(false);
        setPollTick((t) => t + 1);
        // Polling tant qu'un score se calcule (l'écran dit que ça travaille).
        if (anyProcessing(s)) timer = setTimeout(load, 3000);
      } catch {
        if (active) setError(true);
      }
    }
    setScores(null);
    setGlobalScore(null);
    setSeoComposite(null);
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
  // 4 blocs skeleton : score global + les 3 piliers (SEO, GEO, Autorité).
  if (!scores) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-32 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
        <div className="h-72 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
        <div className="h-64 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
        <div className="h-64 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
      </div>
    );
  }

  const byType = (t: ProjectScore["scoreType"]) =>
    scores.find((s) => s.scoreType === t);
  const processing = anyProcessing(scores);

  return (
    <>
      {/* Score global en TÊTE (agrégat serveur des 4 piliers) : chiffre si les 4 sont
          là, sinon carte de déblocage / attente honnête. Argument de déblocage de plus. */}
      <div className="mb-4">
        <RealGlobalScoreCard
          result={globalScore}
          seo={seoComposite}
          scores={scores}
          projectId={projectId}
          onUnlocked={handleUnlocked}
        />
      </div>

      {processing && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent-pink/20 bg-accent-pink/[0.05] px-4 py-2.5 text-[13px] text-text-secondary">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-pink/30 border-t-accent-pink" />
          Analyse en cours. Les scores s&apos;actualisent automatiquement.
        </div>
      )}

      {/* Ordre des piliers = maquette Barth (dashboard origin/main) : Global → GEO →
          SEO → Autorité. */}

      {/* BLOC GEO / Citabilité IA (pilier 1) — UNE carte, 3 layouts décidés SERVEUR
          (display.geoContext.layout de geo_citations) : verrou / composite / constat. */}
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

      {/* BLOC SEO (pilier 2) — Technique + Sémantique consolidés, PageSpeed et Trafic
          en SLOTS (chaque surface a ses sources : on ne les fond pas). En-tête = score
          composite SERVEUR quand les 2 composantes portent un /100 ; sinon état honnête
          (verrou → CTA dans la sous-carte Sémantique ; insuffisant → le constat). Le
          Technique seul n'est JAMAIS présenté comme un score SEO. */}
      <div className="mb-4">
        <RealSeoScoreCard
          seo={
            seoComposite ?? { value: null, band: null, ready: false, missing: [] }
          }
          technique={byType("seo_technical")?.display ?? null}
          semantic={byType("semantic")?.display ?? null}
          semanticStatus={byType("semantic")?.status ?? null}
          adjustmentsRemaining={adjustmentsRemaining}
          projectId={projectId}
          onUnlocked={handleUnlocked}
          onExpertClick={onExpertClick}
          infos={{ technique: scoreInfos.technique, semantique: scoreInfos.semantique }}
          delay={200}
          pageSpeedSlot={
            <RealPageSpeed
              raw={
                (byType("page_speed")?.rawData ?? null) as Parameters<
                  typeof RealPageSpeed
                >[0]["raw"]
              }
              reason={byType("page_speed")?.display?.message ?? null}
              status={byType("page_speed")?.status ?? null}
            />
          }
          trafficSlot={
            <RealTrafficVisibility
              projectId={projectId}
              score={byType("geo_citations") ?? null}
            />
          }
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

      {/* Recommandations — aperçu 3 recos + fondu + CTA « voir tout » vers l'onglet
          Recommandations (rendu validé Alexis 2026-08-07 : sur Analyse on ne montre
          que les 3 premières, le plan complet est sur l'onglet dédié). */}
      <div className="mt-8">
        <RealRecommendations projectId={projectId} preview onSeeAll={onSeeAllRecos} />
      </div>
    </>
  );
}
