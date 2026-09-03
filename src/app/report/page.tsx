"use client";

import { useEffect, useState } from "react";
import RealGlobalScoreCard from "@/components/RealGlobalScoreCard";
import RealSeoScoreCard from "@/components/RealSeoScoreCard";
import PillarScoreBars, { type PillarBar } from "@/components/PillarScoreBars";
import RealGeoScoreCard, { type PlatformBreakdown } from "@/components/RealGeoScoreCard";
import RealPageSpeed from "@/components/RealPageSpeed";
import RealRecommendationCard from "@/components/RealRecommendationCard";
import { ExpertGate } from "@/components/RealRecommendations";
import ExpertCtaBanner from "@/components/ExpertCtaBanner";
import ExpertModal from "@/components/ExpertModal";
import NotorieteInsightsView from "@/components/notoriete/NotorieteInsightsView";
import ConcurrenceTab from "@/components/concurrence/ConcurrenceTab";
import { scoreInfos } from "@/app/dashboard/rapport/score-infos";
import { type Reco, parseRecoContent } from "@/lib/recos";
import ReportTrafficVisibility, {
  type ReportTrafficPoint,
} from "@/components/ReportTrafficVisibility";
import { type NotorieteRaw } from "@/lib/notoriete";
import { citationsDisplay, aiCrawlerAccess, type ProjectScore } from "@/lib/scores";
import {
  fetchReport,
  fetchReportVisibility,
  tokenFromPathname,
  type ReportPayload,
  type ReportVisibility,
  type ReportReco,
} from "@/lib/report";

// Rapport prospect (/report/:token). Surface CLIENT, lecture seule, AUCUNE
// navigation interne. Rend le payload serveur tel quel (blocs display prospect =
// mêmes décisions que le PDF). Export statique : le token vit dans l'URL, lu côté
// client (voir règle nginx /barth-staging/report/ → fallback index.html).

export default function ReportTokenPage() {
  const [data, setData] = useState<ReportPayload | null>(null);
  const [vis, setVis] = useState<ReportVisibility | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "invalid">("loading");
  // CTA « Parler à un expert » (retour Alexis 21/08) : même formulaire lead que l'app
  // (ExpertModal poste sur /public/leads, sans auth) — utilisable en contexte prospect.
  const [showExpert, setShowExpert] = useState(false);

  // Ouverture auto de la modale expert quand on arrive via le bouton « Prendre rendez-vous »
  // de l'email (lien rapport + ?expert=1). Le prospect retombe sur SON analyse, voit ses
  // scores, et le formulaire lead s'ouvre — mieux qu'un agenda nu (décision Kevin 27/08).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("expert") === "1" || p.get("rdv") === "1") setShowExpert(true);
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? tokenFromPathname(window.location.pathname)
        : null;
    if (!token) {
      setState("invalid");
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Poll tant qu'un score n'est pas terminal (comme le dashboard) : sinon le prospect
    // qui ouvre le lien pendant le calcul resterait figé sur le spinner « en cours ».
    // Lecture du stocké uniquement (aucun recalcul serveur), backoff doux.
    const NON_TERMINAL = new Set(["pending", "processing"]);
    let interval = 4000;
    let loaded = false;
    const load = () => {
      fetchReport(token)
        .then((d) => {
          if (!active) return;
          loaded = true;
          setData(d);
          setState("ok");
          const anyRunning = d.scores?.some((s) => NON_TERMINAL.has(s.status ?? ""));
          if (anyRunning) {
            timer = setTimeout(load, interval);
            interval = Math.min(interval + 2000, 15000);
          }
        })
        .catch(() => {
          // N'invalide QUE le premier chargement : un échec de poll transitoire ne
          // doit pas casser un rapport déjà affiché.
          if (active && !loaded) setState("invalid");
        });
    };
    load();
    fetchReportVisibility(token).then((v) => {
      if (active) setVis(v);
    });
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent-pink/30 border-t-accent-pink" />
      </div>
    );
  }
  if (state === "invalid" || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Lien invalide ou expiré</h1>
          <p className="mt-2 text-[14px] font-light text-text-muted">
            Ce lien de rapport n&apos;est plus valide. Contactez votre interlocuteur pour en obtenir un nouveau.
          </p>
        </div>
      </div>
    );
  }

  const { project, scores, recommendations } = data;
  const initial = (project.companyName || project.domain).charAt(0).toUpperCase();
  // Point de lecture UNIQUE (parseRecoContent) : même enveloppe {recommendations, cta,
  // lockedCount} que le dashboard → lockedCount ne peut plus diverger entre les 2 chemins.
  const parsed = parseRecoContent<ReportReco>(recommendations);
  const recos = parsed.recommendations;
  const lockedCount = parsed.lockedCount ?? 0;

  // Refonte 3 piliers — surface prospect alignée sur le dashboard (Global → Score
  // par pilier → SEO → GEO → Autorité). Tout LU depuis le payload serveur (aucun
  // recalcul). Lecture seule stricte : pas de projectId → aucun CTA de déblocage.
  const byType = (t: ReportPayload["scores"][number]["scoreType"]) =>
    scores.find((s) => s.scoreType === t);
  // Scores normalisés en ProjectScore[] (statut requis) — consommés par le score
  // global et le « Score par pilier », comme le dashboard.
  const providedScores = scores.map((s) => ({
    scoreType: s.scoreType,
    scoreValue: s.scoreValue,
    status: (s.status ?? "completed") as ProjectScore["status"],
    rawData: s.rawData,
    display: s.display,
  })) as ProjectScore[];
  const seoComposite = data.seoComposite ?? {
    value: null,
    band: null,
    ready: false,
    missing: [],
  };
  const geoDisplay = byType("geo_citations")?.display ?? null;
  const notoDisplay = byType("notoriete")?.display ?? null;
  const pillarBars: PillarBar[] = [
    {
      label: "SEO",
      value: seoComposite.ready ? (seoComposite.value ?? null) : null,
      band: seoComposite.ready ? (seoComposite.band ?? null) : null,
      anchor: "pilier-seo",
    },
    {
      label: "GEO",
      value: geoDisplay?.scorable ? (geoDisplay.value ?? null) : null,
      band: geoDisplay?.scorable ? (geoDisplay.band ?? null) : null,
      anchor: "pilier-geo",
    },
    {
      label: "Autorité",
      value: notoDisplay?.scorable ? (notoDisplay.value ?? null) : null,
      band: notoDisplay?.scorable ? (notoDisplay.band ?? null) : null,
      anchor: "pilier-autorite",
    },
  ];
  // PageSpeed + Trafic sont INJECTÉS dans le bloc SEO (parité dashboard : chaque
  // surface a ses sources). Trafic prospect = traffic_curve du geo-score + endpoint
  // visibilité (charts read-only, aucun fetch dans la carte).
  const psScore = byType("page_speed");
  const reportTraffic =
    ((byType("geo_citations")?.rawData as { traffic_curve?: ReportTrafficPoint[] } | null)
      ?.traffic_curve ?? []) as ReportTrafficPoint[];
  const hasTraffic = reportTraffic.length >= 2;
  const hasVisibility =
    (vis?.visibility_history?.length ?? 0) >= 2 ||
    (vis?.positions_history?.length ?? 0) >= 2;

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-10 md:py-16">
      {showExpert && <ExpertModal onClose={() => setShowExpert(false)} />}
      <div className="mx-auto max-w-5xl">
        {/* Header client */}
        <section className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-card-inner-bg text-[13px] font-semibold text-text-primary">
              {project.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.logoUrl} alt={project.companyName || project.domain} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                initial
              )}
            </span>
            <span className="text-[14px] font-normal text-text-secondary">
              {project.companyName || project.domain}
            </span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-text-primary md:text-3xl">
            Votre analyse de positionnement digital
          </h1>
          <p className="mt-2 text-[14px] font-light text-text-muted">{project.domain}</p>
        </section>

        {/* Score global (strict-3 SERVEUR) — en TÊTE, comme le dashboard. Lecture
            seule : pas de projectId → aucun CTA, la carte affiche l'état honnête. */}
        <div className="mb-4">
          <RealGlobalScoreCard result={data.globalScore ?? null} scores={providedScores} />
        </div>

        {/* Score par pilier — raccourcis vers les 3 blocs (SEO / GEO / Autorité). */}
        <div className="mb-4">
          <PillarScoreBars pillars={pillarBars} />
        </div>

        {/* BLOC SEO (pilier 1) — Technique + Sémantique consolidés (composite SERVEUR),
            PageSpeed + Trafic injectés en SLOTS. Lecture seule : pas de projectId → la
            sous-carte Sémantique montre l'état sans CTA de déblocage. */}
        <div className="mb-4">
          <RealSeoScoreCard
            seo={seoComposite}
            technique={byType("seo_technical")?.display ?? null}
            semantic={byType("semantic")?.display ?? null}
            semanticStatus={byType("semantic")?.status ?? null}
            infos={{ technique: scoreInfos.technique, semantique: scoreInfos.semantique }}
            pageSpeedSlot={
              psScore ? (
                <RealPageSpeed
                  raw={(psScore.rawData ?? null) as Parameters<typeof RealPageSpeed>[0]["raw"]}
                  reason={psScore.display?.message ?? null}
                  status={psScore.status ?? null}
                />
              ) : undefined
            }
            trafficSlot={
              hasTraffic || hasVisibility ? (
                <ReportTrafficVisibility
                  traffic={reportTraffic}
                  visibility={vis?.visibility_history ?? []}
                  positions={vis?.positions_history ?? []}
                />
              ) : undefined
            }
          />
        </div>

        {/* BLOC GEO / Citabilité IA (pilier 2) — MÊME carte que le dashboard
            (écran=PDF=prospect) : modèle composite, 3 layouts décidés serveur.
            Lecture seule : pas de projectId → le verrou reste informatif, sans bouton. */}
        <div className="mb-4">
          <RealGeoScoreCard
            display={citationsDisplay(scores)}
            status={byType("geo_citations")?.status ?? null}
            crawlerAccess={aiCrawlerAccess(scores)}
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

        {/* BLOC Autorité (pilier 3) — MÊME source que le dashboard (parité
            écran=report=PDF), read-only strict : aucun bouton d'action. Le composant
            porte son propre en-tête pilier (#pilier-autorite). */}
        {(() => {
          const noto = byType("notoriete");
          if (!noto) return null;
          const composite = noto.display?.scorable ? (noto.display.value ?? null) : null;
          return (
            <section className="mb-4">
              <NotorieteInsightsView
                raw={(noto.rawData ?? null) as NotorieteRaw | null}
                composite={composite}
                compositeMessage={noto.display?.message ?? null}
                clientName={project.companyName || project.domain}
                authorityProcessing={noto.status === "processing" || noto.status === "pending"}
                benchmarkProcessing={scores.some(
                  (s) => s.scoreType === "semantic" && (s.status === "processing" || s.status === "pending"),
                )}
                readOnly
              />
            </section>
          );
        })()}

        {/* Analyse concurrentielle (part de voix / couverture mots-clés) — parité avec
            l'app ET le PDF (retour Alexis 2026-08-12 : « tout dans le lien partagé »).
            Read-only strict, alimenté par le score sémantique du payload (aucun fetch,
            aucun bouton). Gatée comme le PDF : affichée seulement si le sémantique est
            débloqué (completed) ou en cours ; masquée sinon (pas de vide inutile). */}
        {(() => {
          const sem = byType("semantic");
          const show = sem && ["completed", "processing", "pending"].includes(sem.status ?? "");
          if (!show) return null;
          return (
            <section className="mt-12">
              <h2 className="mb-5 text-xl font-medium tracking-tight text-text-primary">
                Analyse concurrentielle
              </h2>
              <ConcurrenceTab
                projectId={project.domain}
                providedScores={providedScores}
                clientName={project.companyName || project.domain}
                clientInitial={initial}
                clientLogoUrl={project.logoUrl ?? null}
                readOnly
              />
            </section>
          );
        })()}

        {/* Recommandations — GATE EXPERT (Option 1, Alexis+Kevin 27/08) : `visibleCount`
            recos en clair, le reste FLOUTÉ mais ce sont les VRAIES (« en transparent »).
            Flou cosmétique (tradeoff assumé). Le PDF reste le livrable complet.
            `pilier` → `pillar` pour la carte. */}
        {recos.length > 0 && (() => {
          const visibleCount = Math.max(0, recos.length - lockedCount);
          const toReco = (r: ReportReco) => ({ ...r, pillar: r.pilier }) as Reco;
          return (
          <section className="mt-10">
            <h2 className="mb-5 text-xl font-medium tracking-tight text-text-primary">
              Recommandations stratégiques
            </h2>
            <div className="flex flex-col gap-3">
              {recos.slice(0, visibleCount).map((reco: ReportReco, i) => (
                <RealRecommendationCard key={i} index={i} rec={toReco(reco)} />
              ))}
              {lockedCount > 0 && (
                <ExpertGate
                  recos={recos.slice(visibleCount).map(toReco)}
                  startIndex={visibleCount}
                  onExpertClick={() => setShowExpert(true)}
                />
              )}
            </div>
            <ExpertCtaBanner
              onExpertClick={() => setShowExpert(true)}
              className="mt-8"
              title="Priorisez ce plan d'action avec un expert"
              body="15 minutes offertes avec un consultant AWI pour séquencer ces recommandations sur 90 jours selon votre impact business."
              cta="Bénéficier de 15 min avec un expert"
            />
          </section>
          );
        })()}

        {/* Branding GSI, aucune navigation interne */}
        <footer className="mt-12 border-t border-border-subtle pt-6 text-center">
          <p className="text-[12px] font-light text-text-muted">
            Analyse réalisée avec Global Search Index
          </p>
        </footer>
      </div>
    </main>
  );
}
