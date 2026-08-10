"use client";

import { useEffect, useState } from "react";
import RealScoreArc from "@/components/RealScoreArc";
import RealGeoScoreCard, { type PlatformBreakdown } from "@/components/RealGeoScoreCard";
import NotorieteInsightsView from "@/components/notoriete/NotorieteInsightsView";
import ReportTrafficVisibility, {
  type ReportTrafficPoint,
} from "@/components/ReportTrafficVisibility";
import { type NotorieteRaw } from "@/lib/notoriete";
import { citationsDisplay, aiCrawlerAccess, type ScoreDisplay } from "@/lib/scores";
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

const ICON = {
  seo: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  geo: "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z",
  authority: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z",
  semantic: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
};
// Le bloc GEO est le PILIER IA (Lisibilité + Citations), rendu à part sous les
// arcs simples. Le détail concurrents du GEO est PROSPECT-FACING (décision Kevin).
const SCORES: { type: ReportPayload["scores"][number]["scoreType"]; label: string; icon: string }[] = [
  { type: "seo_technical", label: "SEO Technique", icon: ICON.seo },
  { type: "authority", label: "Autorité", icon: ICON.authority },
  { type: "semantic", label: "SEO Sémantique", icon: ICON.semantic },
];

function icon(d: string) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IMPACT_STYLE: Record<string, string> = {
  Fort: "text-red-400 border-red-400/20 bg-red-500/10",
  Moyen: "text-orange-400 border-orange-400/20 bg-orange-500/10",
  Faible: "text-sky-400 border-sky-400/20 bg-sky-500/10",
};


export default function ReportTokenPage() {
  const [data, setData] = useState<ReportPayload | null>(null);
  const [vis, setVis] = useState<ReportVisibility | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "invalid">("loading");

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
    fetchReport(token)
      .then((d) => {
        if (!active) return;
        setData(d);
        setState("ok");
      })
      .catch(() => {
        if (active) setState("invalid");
      });
    fetchReportVisibility(token).then((v) => {
      if (active) setVis(v);
    });
    return () => {
      active = false;
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
  const recos = recommendations?.recommendations ?? [];

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-10 md:py-16">
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

        {/* Pilier IA — EN TÊTE (parité dashboard : le PILIER IA d'abord, retour
            Alexis 2026-08-10). MÊME carte que le dashboard (écran=PDF=prospect) :
            modèle composite, 3 layouts décidés serveur (audience prospect). Lecture
            seule : pas de projectId → le verrou reste informatif, sans bouton. */}
        <section className="flex flex-col gap-4">
          <RealGeoScoreCard
            display={citationsDisplay(scores)}
            status={scores.find((s) => s.scoreType === "geo_citations")?.status ?? null}
            crawlerAccess={aiCrawlerAccess(scores)}
            platformBreakdown={
              (
                scores.find((s) => s.scoreType === "geo_citations")?.rawData as
                  | { details?: { platform_breakdown?: PlatformBreakdown } }
                  | null
              )?.details?.platform_breakdown ?? null
            }
            unavailable={
              (
                scores.find((s) => s.scoreType === "geo_citations")?.rawData as
                  | { geo_status?: string }
                  | null
              )?.geo_status === "unavailable"
            }
          />
        </section>

        {/* Scores — 3 arcs (SEO Tech / Autorité / Sémantique), APRÈS le pilier IA.
            Rendus depuis les blocs display serveur (mêmes que le PDF). */}
        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCORES.map(({ type, label, icon: d }) => {
            // UNIFICATION AUTORITÉ : le pilier « Autorité » lit le composite média
            // (score notoriete), même chiffre que dashboard/PDF (parité écran=PDF=prospect).
            const sourceType = type === "authority" ? "notoriete" : type;
            const sc = scores.find((s) => s.scoreType === sourceType);
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
            return <RealScoreArc key={type} label={label} icon={icon(d)} display={display} />;
          })}
        </section>

        {/* Notoriété & autorité média — MÊME source que le dashboard (parité
            écran=report=PDF), read-only strict : aucun bouton d'action côté prospect.
            Le benchmark suit son état (débloqué → table ; sinon verrou sans bouton). */}
        {(() => {
          const noto = scores.find((s) => s.scoreType === "notoriete");
          if (!noto) return null;
          const composite = noto.display?.scorable ? (noto.display.value ?? null) : null;
          return (
            <section className="mt-10">
              <h2 className="mb-5 text-xl font-medium tracking-tight text-text-primary">
                Notoriété &amp; autorité média
              </h2>
              <NotorieteInsightsView
                raw={(noto.rawData ?? null) as NotorieteRaw | null}
                composite={composite}
                compositeMessage={noto.display?.message ?? null}
                clientName={project.companyName || project.domain}
                readOnly
              />
            </section>
          );
        })()}

        {/* Trafic mensuel + Indice de visibilité — MÊME chart que le dashboard
            (TrafficChart VF), parité écran interne (retour Alexis 2026-08-10 : les
            deux courbes manquaient au lien partagé). Trafic = traffic_curve du
            geo-score ; visibilité = endpoint /report/:token/visibility. */}
        {(() => {
          const traffic =
            ((
              scores.find((s) => s.scoreType === "geo_citations")?.rawData as
                | { traffic_curve?: ReportTrafficPoint[] }
                | null
            )?.traffic_curve ?? []) as ReportTrafficPoint[];
          const hasTraffic = traffic.length >= 2;
          const hasVisibility =
            (vis?.visibility_history?.length ?? 0) >= 2 ||
            (vis?.positions_history?.length ?? 0) >= 2;
          if (!hasTraffic && !hasVisibility) return null;
          return (
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-medium tracking-tight text-text-primary">
                Trafic &amp; visibilité
              </h2>
              <ReportTrafficVisibility
                traffic={traffic}
                visibility={vis?.visibility_history ?? []}
                positions={vis?.positions_history ?? []}
              />
            </section>
          );
        })()}

        {/* Recommandations — déjà filtrées audience prospect côté serveur */}
        {recos.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-5 text-xl font-medium tracking-tight text-text-primary">
              Recommandations stratégiques
            </h2>
            <div className="flex flex-col gap-3">
              {recos.map((reco: ReportReco, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border-subtle bg-bg-card p-5"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {reco.impact && (
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${IMPACT_STYLE[reco.impact] ?? "text-text-muted border-border-subtle bg-card-inner-bg"}`}>
                        {reco.impact}
                      </span>
                    )}
                    {(reco.axe || reco.pilier) && (
                      <span className="text-[13px] font-medium text-text-primary">
                        {reco.axe || reco.pilier}
                      </span>
                    )}
                  </div>
                  {(reco.diagnostic || reco.probleme) && (
                    <p className="text-[14px] font-medium text-text-primary/90">
                      {reco.diagnostic || reco.probleme}
                    </p>
                  )}
                  {(reco.objectif || reco.action) && (
                    <p className="mt-1.5 text-[13.5px] font-light leading-relaxed text-text-secondary">
                      {reco.objectif || reco.action}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {recommendations?.cta && (
              <p className="mt-6 text-center text-[14px] font-light leading-relaxed text-text-secondary">
                {recommendations.cta}
              </p>
            )}
          </section>
        )}

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
