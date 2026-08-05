"use client";

import { useEffect, useState } from "react";
import type { GeoCitationsDisplay, AiCrawlerAccess } from "@/lib/scores";
import { bandLabel } from "@/lib/scoreLabel";
import ScoreInfoModal from "./ScoreInfoModal";
import InsightNote from "./InsightNote";
import SemanticUnlockModal from "./SemanticUnlockModal";
import { CompetitorBreakdownList } from "./PilierIA";
import { scoreInfos } from "@/app/dashboard/rapport/score-infos";

// ─────────────────────────────────────────────────────────────────────────────
// Carte « Visibilité GEO » — modèle composite (décision Alexis + CTO SEO Engine
// 2026-08-05, pattern autorité). UNE carte, TROIS layouts, tous décidés SERVEUR
// (display.geoContext.layout) : le composant LIT et rend, il ne route NI ne
// calcule aucun seuil (invariant « 56 vs 12 »).
//   • 'lock'      → verrou pré-déblocage (appel à l'action, technique masquée).
//   • 'composite' → score consolidé : composite en tête + 2 sous-composantes.
//   • 'statement' → constat qualitatif en tête, technique en sous-ligne.
// ─────────────────────────────────────────────────────────────────────────────

const NEUTRAL = { start: "#9ca3af", end: "#cbd5e1" };
const BAND_GRADIENT: Record<"critical" | "medium" | "good", { start: string; end: string }> = {
  critical: { start: "#ef4444", end: "#f97316" },
  medium: { start: "#f97316", end: "#eab308" },
  good: { start: "#22c55e", end: "#4ade80" },
};
const ARC_PATH =
  "M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301";

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

const eyeIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const lockIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

export type PlatformBreakdown = Record<string, { pages: number; citations: number }>;

/** « 2026-08-05T… » → « 5 août 2026 ». Formatage pur (présentation), pas de
 *  décision métier : la carte formate la date que le serveur a fixée. */
function formatMeasuredAt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function RealGeoScoreCard({
  display,
  status = null,
  platformBreakdown,
  crawlerAccess = null,
  unavailable = false,
  delay = 0,
  projectId,
  onUnlocked,
}: {
  /** Display du score geo_citations (porte geoContext.layout). */
  display: GeoCitationsDisplay;
  /** Statut pipeline du geo_citations (loader vs verrou). */
  status?: string | null;
  /** Détail par moteur — geo_citations.details.platform_breakdown, ou null. */
  platformBreakdown: PlatformBreakdown | null;
  /** Accès des bots IA (geo_citability.complementary). allBlocked → caveat critique. */
  crawlerAccess?: AiCrawlerAccess | null;
  /** true → citations momentanément indisponibles (panne Ahrefs). */
  unavailable?: boolean;
  delay?: number;
  /** Requis pour le CTA de déblocage (layout 'lock'). */
  projectId?: string;
  /** Appelé après un déblocage réussi → le parent recharge les scores (POST=repoll). */
  onUnlocked?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const ctx = display.geoContext ?? null;
  const loading = status === "processing" || status === "pending";
  // Layout décidé serveur. Absence de contexte (score non câblé) → verrou.
  const layout: "loading" | "lock" | "composite" | "statement" = loading
    ? "loading"
    : (ctx?.layout ?? "lock");

  const info = scoreInfos.geo;
  const measuredAtLabel = formatMeasuredAt(ctx?.measuredAt ?? null);
  const breakdown =
    ctx?.competitorBreakdown && ctx.competitorBreakdown.length > 0
      ? ctx.competitorBreakdown
      : null;

  const radius = 86.33;
  const circumference = Math.PI * radius;

  const Header = ({ withDate = false }: { withDate?: boolean }) => (
    <div className="flex w-full items-center gap-2 px-5 pt-5 md:px-6 md:pt-6">
      <span className="text-text-primary/80">{geoIcon}</span>
      <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Visibilité GEO</span>
      {withDate && measuredAtLabel && (
        <span className="ml-auto text-[11px] font-light text-text-muted">Mesuré le {measuredAtLabel}</span>
      )}
      <button
        onClick={() => setShowInfo(true)}
        className={`${withDate && measuredAtLabel ? "ml-3" : "ml-auto"} flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-card-inner-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
        aria-label="Informations sur le score GEO"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
        </svg>
      </button>
    </div>
  );

  // Bandeau caveat « robots IA bloqués » — signal fort sur la technique, affiché
  // quel que soit le layout (le score note la structure, pas l'accès).
  const CrawlerBanner = () =>
    crawlerAccess ? (
      <div className="px-5 pt-4 md:px-6">
        <div className="flex items-start gap-2.5 rounded-xl border border-red-400/30 bg-red-500/[0.07] px-3.5 py-2.5">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-[12px] font-light leading-relaxed text-text-secondary">
            <span className="font-medium text-text-primary">
              Robots d&apos;IA de réponse bloqués : site non citable par les IA.
            </span>{" "}
            Votre site interdit l&apos;accès aux moteurs qui citent des sources
            ({crawlerAccess.answerBlocked.join(", ")}) : ils ne peuvent pas vous
            citer, même avec un contenu bien structuré.
          </p>
        </div>
      </div>
    ) : null;

  const cardClass =
    "overflow-hidden rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]";
  const cardStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo)",
  };

  return (
    <>
      {showInfo && <ScoreInfoModal info={info} icon={geoIcon} onClose={() => setShowInfo(false)} />}
      {showUnlock && projectId && (
        <SemanticUnlockModal
          projectId={projectId}
          onClose={() => setShowUnlock(false)}
          onSubmit={() => {
            setShowUnlock(false);
            onUnlocked?.();
          }}
        />
      )}

      <div className={cardClass} style={cardStyle}>
        <Header withDate={layout === "composite" || layout === "statement"} />
        <CrawlerBanner />

        {/* ── LOADING : cascade en cours, aucun chiffre trompeur. ── */}
        {layout === "loading" && (
          <div className="flex flex-col items-center gap-3 p-8 md:p-10">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-pink/30 border-t-accent-pink" />
            <p className="text-[13px] font-light text-text-secondary">
              Mesure de vos citations par les IA en cours…
            </p>
          </div>
        )}

        {/* ── LOCK : verrou pré-déblocage (pattern autorité, technique masquée). ── */}
        {layout === "lock" && (
          <div className="flex flex-col items-center gap-4 px-6 py-8 text-center md:py-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-pink/10 text-accent-pink">
              {lockIcon}
            </span>
            <div className="max-w-md">
              <h3 className="text-[16px] font-semibold text-text-heading">
                Votre visibilité GEO se débloque avec l&apos;analyse concurrentielle
              </h3>
              <p className="mt-1.5 text-[13px] font-light leading-relaxed text-text-secondary">
                {display.message ??
                  "Le score GEO compare vos citations par les IA à celles de vos concurrents. Renseignez votre panel pour le mesurer."}
              </p>
            </div>
            {projectId && (
              <button
                onClick={() => setShowUnlock(true)}
                className="rounded-full bg-accent-pink px-5 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                Débloquer mon score GEO
              </button>
            )}
          </div>
        )}

        {/* ── COMPOSITE : composite en tête + 2 sous-composantes à côté. ── */}
        {layout === "composite" && ctx && (
          <CompositeBody
            ctx={ctx}
            band={display.band}
            visible={visible}
            delay={delay}
            circumference={circumference}
            platformBreakdown={platformBreakdown}
            unavailable={unavailable}
            breakdown={breakdown}
            showAll={showAll}
            setShowAll={setShowAll}
          />
        )}

        {/* ── STATEMENT : constat en tête, technique en sous-ligne. ── */}
        {layout === "statement" && (
          <StatementBody
            label={display.label}
            message={display.message}
            subTechnique={ctx?.subTechnique ?? null}
            frame={ctx?.frame ?? null}
            breakdown={breakdown}
            userPages={ctx?.userPages ?? 0}
          />
        )}

        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <InsightNote>
            Le score GEO mesure votre visibilité dans les réponses des IA génératives (ChatGPT, Gemini, Perplexity…).{" "}
            <span className="font-medium text-text-primary">Technique</span> = capacité de votre site à être lu et repris,{" "}
            <span className="font-medium text-text-primary">Position concurrentielle</span> = vos citations réelles face au panel.
          </InsightNote>
        </div>
      </div>
    </>
  );
}

// ── Corps du layout 'composite' ─────────────────────────────────────────────
function CompositeBody({
  ctx,
  band,
  visible,
  delay,
  circumference,
  platformBreakdown,
  unavailable,
  breakdown,
  showAll,
  setShowAll,
}: {
  ctx: NonNullable<GeoCitationsDisplay["geoContext"]>;
  band: "critical" | "medium" | "good" | null;
  visible: boolean;
  delay: number;
  circumference: number;
  platformBreakdown: PlatformBreakdown | null;
  unavailable: boolean;
  breakdown: NonNullable<GeoCitationsDisplay["geoContext"]>["competitorBreakdown"] | null;
  showAll: boolean;
  setShowAll: (fn: (v: boolean) => boolean) => void;
}) {
  const composite = ctx.composite;
  const col = band ? BAND_GRADIENT[band] : NEUTRAL;
  const offset =
    composite != null
      ? circumference - (Math.min(Math.max(composite, 0), 100) / 100) * circumference
      : circumference;

  const rows = PLATFORMS.map((p) => {
    const stat = platformBreakdown ? platformBreakdown[p.key] : undefined;
    return { name: p.name, logo: p.logo, citations: stat ? stat.citations : null, pages: stat ? stat.pages : null };
  });
  const maxCitations = Math.max(1, ...rows.map((r) => r.citations ?? 0));
  const TOP_N = 4;
  const visibleRows = showAll ? rows : rows.slice(0, TOP_N);
  const hiddenCount = rows.length - TOP_N;

  const citedSubtitle =
    ctx.userCitations != null && ctx.userCitations > 0
      ? `vous êtes cité ${ctx.userCitations} fois`
      : "citations relatives au panel";

  return (
    <>
      <div className="flex flex-col items-center gap-6 p-5 md:flex-row md:items-center md:gap-8 md:p-6">
        {/* Composite en tête */}
        <div className="flex shrink-0 flex-col items-center gap-2.5">
          <div className="relative">
            <svg viewBox="0 0 181 95" className="h-24 w-44">
              <path d={ARC_PATH} fill="none" stroke="var(--arc-bg)" strokeWidth="8" strokeLinecap="round" />
              {composite != null && (
                <path
                  d={ARC_PATH}
                  fill="none"
                  stroke="url(#geo-comp-grad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={visible ? offset : circumference}
                  style={{ transition: `stroke-dashoffset 1.2s var(--ease-in-out) ${delay}ms` }}
                />
              )}
              <defs>
                <linearGradient id="geo-comp-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={col.start} />
                  <stop offset="100%" stopColor={col.end} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-end justify-center">
              {composite != null ? (
                <>
                  <span className="text-3xl font-bold tabular-nums text-text-primary">{composite}</span>
                  <span className="mb-1 text-sm text-text-muted">/100</span>
                </>
              ) : (
                <span className="mb-2 text-[13px] font-medium text-text-muted">—</span>
              )}
            </div>
          </div>
          {band && (
            <span className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${bandLabel(band).chip}`}>
              {bandLabel(band).label}
            </span>
          )}
          <span className="text-[12px] font-medium text-text-secondary">Score GEO</span>
        </div>

        {/* Les 2 sous-composantes À CÔTÉ */}
        <div className="grid w-full flex-1 grid-cols-2 gap-3 md:border-l md:border-border-subtle md:pl-8">
          <div className="rounded-xl border border-border-subtle bg-card-inner-bg px-4 py-3">
            <div className="text-[22px] font-bold tabular-nums text-text-primary">
              {ctx.subTechnique ?? "—"}
            </div>
            <div className="mt-0.5 text-[12px] font-medium text-text-secondary">Technique</div>
            <div className="text-[11px] font-light leading-tight text-text-muted">structure, accès, formats</div>
          </div>
          <div className="rounded-xl border border-border-subtle bg-card-inner-bg px-4 py-3">
            <div className="text-[22px] font-bold tabular-nums text-text-primary">
              {ctx.subCitations ?? "—"}
            </div>
            <div className="mt-0.5 text-[12px] font-medium text-text-secondary">Position concurrentielle</div>
            <div className="text-[11px] font-light leading-tight text-text-muted">{citedSubtitle}</div>
          </div>
        </div>
      </div>

      {/* Détail nominatif vs concurrents (si le panel le fournit). */}
      {breakdown && (
        <div className="px-5 md:px-6">
          <CompetitorBreakdownList breakdown={breakdown} userPages={ctx.userPages ?? 0} />
        </div>
      )}

      {/* Détail par moteur d'IA — citations réelles du prospect. */}
      <div className="flex flex-col gap-3 px-5 pb-2 pt-4 md:px-6">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium uppercase tracking-wide text-text-muted">Par moteur d&apos;IA</span>
          <span className="text-[11px] font-light text-text-muted">Citations · Pages</span>
        </div>
        {unavailable && (
          <p className="text-[12px] font-light leading-relaxed text-text-secondary">
            Mesure des citations par moteur momentanément indisponible. Réessayez dans quelques minutes.
          </p>
        )}
        {!unavailable &&
          visibleRows.map((m) => {
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
    </>
  );
}

// ── Corps du layout 'statement' ─────────────────────────────────────────────
function StatementBody({
  label,
  message,
  subTechnique,
  frame,
  breakdown,
  userPages,
}: {
  label: string | null;
  message: string | null;
  subTechnique: number | null;
  frame: "opportunite" | "urgence" | "technique" | "locked" | null;
  breakdown: NonNullable<GeoCitationsDisplay["geoContext"]>["competitorBreakdown"] | null;
  userPages: number;
}) {
  // Cadrage 'urgence' / 'opportunite' → accent rose (langage Barth). 'technique'
  // → neutre (mesure non concluante, pas un argument commercial).
  const isCommercial = frame === "urgence" || frame === "opportunite";
  const accent = isCommercial
    ? "border-accent-pink/20 bg-accent-pink/[0.06]"
    : "border-border-subtle bg-card-inner-bg";
  const iconWrap = isCommercial ? "bg-accent-pink/10 text-accent-pink" : "bg-white/[0.06] text-text-muted";

  return (
    <>
      <div className="px-5 pt-4 md:px-6">
        <div className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${accent}`}>
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
            {eyeIcon}
          </span>
          <div>
            <h3 className="text-[17px] font-semibold leading-snug text-text-heading">
              {label ?? "Citations par les IA"}
            </h3>
            {message && (
              <p className="mt-1.5 text-[13px] font-light leading-relaxed text-text-secondary">{message}</p>
            )}
            {/* Technique en SOUS-LIGNE — jamais seule ni en tête (règle métier serveur). */}
            {subTechnique != null && (
              <p className="mt-2 text-[12px] font-light text-text-muted">
                Score technique : <span className="font-medium text-text-secondary">{subTechnique}/100</span>{" "}
                (structure, accès, formats).
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Détail nominatif vs concurrents (si le panel le fournit). */}
      {breakdown && (
        <div className="px-5 pt-4 pb-1 md:px-6">
          <CompetitorBreakdownList breakdown={breakdown} userPages={userPages} />
        </div>
      )}
    </>
  );
}
