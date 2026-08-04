"use client";

import { useEffect, useState } from "react";
import type { ScoreDisplay, AiCrawlerAccess } from "@/lib/scores";
import { bandLabel } from "@/lib/scoreLabel";
import ScoreInfoModal from "./ScoreInfoModal";
import InsightNote from "./InsightNote";
import { scoreInfos } from "@/app/dashboard/rapport/score-infos";

// Encart « Visibilité GEO » — design VERBATIM de la maquette Barthélemy
// (GeoScoreCard), mais câblé : l'arc vient du display serveur (geo_citability,
// régime-aware, zéro recalcul de seuils), et le détail « par moteur d'IA » vient
// du VRAI platform_breakdown de geo_citations (ChatGPT/Perplexity/Copilot/Grok/
// Gemini/Google AI Mode). Aucun chiffre factice : moteur sans donnée = « non audité ».

const NEUTRAL = { start: "#9ca3af", end: "#cbd5e1" };
const BAND_GRADIENT: Record<"critical" | "medium" | "good", { start: string; end: string }> = {
  critical: { start: "#ef4444", end: "#f97316" },
  medium: { start: "#f97316", end: "#eab308" },
  good: { start: "#22c55e", end: "#4ade80" },
};
const ARC_PATH =
  "M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301";

// Métadonnées d'affichage des moteurs (nom lisible + logo déployé). Le préfixe
// /barth-staging suit la convention des autres assets de cette branche.
const PLATFORMS: { key: string; name: string; logo: string }[] = [
  { key: "chatgpt", name: "ChatGPT", logo: "/barth-staging/chatgpt.png" },
  { key: "perplexity", name: "Perplexity", logo: "/barth-staging/perplexity.png" },
  { key: "copilot", name: "Copilot", logo: "/barth-staging/copilot.svg" },
  { key: "grok", name: "Grok", logo: "/barth-staging/grok.svg" },
  { key: "gemini", name: "Gemini", logo: "/barth-staging/gemini.png" },
  { key: "google_ai_mode", name: "Google AI Mode", logo: "/barth-staging/google.svg" },
];

const geoIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
  </svg>
);

export type PlatformBreakdown = Record<string, { pages: number; citations: number }>;

export default function RealGeoScoreCard({
  display,
  platformBreakdown,
  crawlerAccess = null,
  unavailable = false,
  delay = 0,
}: {
  /** Score de l'arc — geo_citability (Lisibilité) résolu serveur. */
  display: ScoreDisplay;
  /** Détail par moteur — geo_citations.details.platform_breakdown, ou null si non mesuré. */
  platformBreakdown: PlatformBreakdown | null;
  /** Accès des bots IA (geo_citability.complementary). allBlocked → caveat critique :
   *  le score note la structure, pas l'accès ; un 100 avec tous les bots bloqués reste
   *  incitable. null = non mesuré. */
  crawlerAccess?: AiCrawlerAccess | null;
  /** true → geo_citations momentanément indisponible (panne Ahrefs) : le par-moteur
   *  affiche une note transitoire au lieu de 6 « Non audité » trompeurs (« cité nulle part »). */
  unavailable?: boolean;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const radius = 86.33;
  const circumference = Math.PI * radius;

  // Arc régime-aware : couleur = bande SERVEUR (pas de recalcul), gris si neutre.
  const scorable = display.scorable && display.value != null;
  const value = scorable ? display.value! : null;
  const col =
    display.neutralArc || !display.band ? NEUTRAL : BAND_GRADIENT[display.band];
  const offset =
    value != null ? circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference : circumference;

  // Lignes moteurs à partir du breakdown réel. Ordre fixe (PLATFORMS). Un moteur
  // absent du breakdown = « non audité » (jamais 0 inventé).
  const rows = PLATFORMS.map((p) => {
    const stat = platformBreakdown ? platformBreakdown[p.key] : undefined;
    return {
      name: p.name,
      logo: p.logo,
      citations: stat ? stat.citations : null,
      pages: stat ? stat.pages : null,
    };
  });
  const maxCitations = Math.max(1, ...rows.map((r) => r.citations ?? 0));
  const TOP_N = 4;
  const visibleRows = showAll ? rows : rows.slice(0, TOP_N);
  const hiddenCount = rows.length - TOP_N;
  const info = scoreInfos.geo;

  return (
    <>
      {showInfo && <ScoreInfoModal info={info} icon={geoIcon} onClose={() => setShowInfo(false)} />}
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
        </div>

        {/* Caveat crawlers IA : le score note la structure, PAS l'accès des bots.
            allBlocked → rouge (site incitable malgré un bon score) ; blocage partiel
            → ambre. Contextualise un 100 trompeur quand les IA ne peuvent pas crawler. */}
        {crawlerAccess && crawlerAccess.blocked.length > 0 && (
          <div className="px-5 pt-4 md:px-6">
            <div
              className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 ${
                crawlerAccess.allBlocked
                  ? "border-red-400/30 bg-red-500/[0.07]"
                  : "border-amber-400/30 bg-amber-500/[0.07]"
              }`}
            >
              <svg
                className={`mt-0.5 h-4 w-4 shrink-0 ${crawlerAccess.allBlocked ? "text-red-400" : "text-amber-500"}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-[12px] font-light leading-relaxed text-text-secondary">
                {crawlerAccess.allBlocked ? (
                  <>
                    <span className="font-medium text-text-primary">
                      Robots d&apos;IA bloqués — site non citable en l&apos;état.
                    </span>{" "}
                    Le score mesure la structure du contenu, mais votre site interdit
                    l&apos;accès à tous les moteurs d&apos;IA ({crawlerAccess.blocked.join(", ")}).
                    Sans accès, aucun ne peut vous citer malgré un contenu bien structuré.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-text-primary">Accès IA partiel.</span>{" "}
                    Certains robots d&apos;IA sont bloqués ({crawlerAccess.blocked.join(", ")}),
                    ce qui limite votre citabilité réelle.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-5 p-5 md:flex-row md:items-center md:gap-8 md:p-6">
          {/* Arc score + interprétation */}
          <div className="flex shrink-0 flex-col items-center gap-2.5">
            <div className="relative">
              <svg viewBox="0 0 181 95" className="h-24 w-44">
                <path d={ARC_PATH} fill="none" stroke="var(--arc-bg)" strokeWidth="8" strokeLinecap="round" />
                {value != null && (
                  <path
                    d={ARC_PATH}
                    fill="none"
                    stroke="url(#geo-arc-grad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={visible ? offset : circumference}
                    style={{ transition: `stroke-dashoffset 1.2s var(--ease-in-out) ${delay}ms` }}
                  />
                )}
                <defs>
                  <linearGradient id="geo-arc-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={col.start} />
                    <stop offset="100%" stopColor={col.end} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-end justify-center">
                {value != null ? (
                  <>
                    <span className="text-3xl font-bold tabular-nums text-text-primary">{value}</span>
                    <span className="mb-1 text-sm text-text-muted">/100</span>
                  </>
                ) : (
                  <span className="mb-2 text-[13px] font-medium text-text-muted">—</span>
                )}
              </div>
            </div>
            {display.band ? (
              <span className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${bandLabel(display.band).chip}`}>
                {bandLabel(display.band).label}
              </span>
            ) : (
              // Pas de bande (non scorable) : pastille de repli — JAMAIS un vide.
              // Le libellé serveur s'il existe, sinon « Non disponible ».
              <span className="whitespace-nowrap rounded-full border border-border-subtle bg-card-inner-bg px-2.5 py-0.5 text-[11px] font-medium text-text-muted">
                {display.label ?? "Non disponible"}
              </span>
            )}
          </div>

          {/* Détail par IA */}
          <div className="flex w-full flex-1 flex-col gap-3 md:border-l md:border-border-subtle md:pl-8">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium uppercase tracking-wide text-text-muted">Par moteur d&apos;IA</span>
              <span className="text-[11px] font-light text-text-muted">Citations · Pages</span>
            </div>
            {unavailable && (
              // Panne Ahrefs : ni chiffres factices, ni « Non audité » trompeur.
              <p className="text-[12px] font-light leading-relaxed text-text-secondary">
                Mesure des citations par moteur momentanément indisponible.
                Réessayez dans quelques minutes.
              </p>
            )}
            {!unavailable && visibleRows.map((m) => {
              const audited = m.citations !== null;
              const barPct = audited ? (m.citations! / maxCitations) * 100 : 0;
              return (
                <div key={m.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-card-inner-bg">
                    <img src={m.logo} alt={m.name} className="h-full w-full object-contain p-1" />
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
                      {audited && <div className="h-full rounded-full bg-accent-pink" style={{ width: `${barPct}%` }} />}
                    </div>
                  </div>
                </div>
              );
            })}
            {!unavailable && hiddenCount > 0 && (
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
