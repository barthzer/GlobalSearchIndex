"use client";

// Vue PRÉSENTATIONNELLE « Autorité médiatique de la marque » — zéro fetch, tout en
// props. Source unique du rendu, partagée par :
//  - RealNotorieteInsights (dashboard interne : fetch + repoll → passe les props),
//  - /report prospect (read-only strict : props depuis le payload token).
//
// Refonte 3 piliers (2026-09-03) : cadre VISUEL de Barth (AutoriteScoreCard de
// GSI-Front origin/main) — pilier card + PillarHeader + ScoreGauge + 2 SubCards
// (Backlinks / Grands médias) + BenchmarkSection + conseil. NOTRE machine à états
// préservée : composite serveur / calcul en cours / données insuffisantes, et tous
// les états du benchmark (débloqué / en cours / verrouillé / read-only prospect).
// Le rang « X/4 » de Barth est OMIS (donnée non produite — décision Kevin).

import { useEffect, useState } from "react";
import {
  backlinksView,
  mediaView,
  benchmarkView,
  type NotorieteRaw,
} from "@/lib/notoriete";
import BenchmarkSection from "./BenchmarkSection";
import type { CompetitorRow as BarthCompetitorRow } from "./data";
import { ScoreGauge, PillarHeader, SubCard, RankBadge } from "../pillar/PillarParts";

type Band = "critical" | "medium" | "good";

const ICONS = {
  header: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  ),
  backlinks: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  ),
  grandsMedias: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
};

/** Puce de croissance backlinks — vert si hausse, rouge si baisse, rien si « — ». */
function GrowthChip({ growth }: { growth: string }) {
  if (growth.startsWith("+"))
    return (
      <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
        {growth}
      </span>
    );
  if (growth.startsWith("-"))
    return (
      <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-500">
        {growth}
      </span>
    );
  return null;
}

/** Placeholder compact « calcul en cours » d'une sous-carte (pas de faux 0). */
function SubComputing() {
  return (
    <div className="flex items-center gap-2 py-2">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-pink/20 border-t-accent-pink" />
      <span className="text-[12px] font-light text-text-muted">Calcul en cours…</span>
    </div>
  );
}

export default function NotorieteInsightsView({
  raw,
  composite,
  band = null,
  compositeMessage,
  clientName,
  benchmarkProcessing = false,
  authorityProcessing = false,
  readOnly = false,
  onUnlockClick,
}: {
  /** raw_data du score notoriété (source des sous-cartes + benchmark). */
  raw: NotorieteRaw | null;
  /** Autorité média composite /100 résolu SERVEUR. null → calcul/insuffisant. */
  composite: number | null;
  /** Bande serveur (couleur de la jauge). Requise avec composite (invariant « 56 vs 12 »). */
  band?: Band | null;
  /** Message serveur quand composite null (jamais un faux /100). */
  compositeMessage?: string | null;
  clientName: string;
  /** Benchmark en cours de calcul (cascade serveur) → « en cours » au lieu du verrou. */
  benchmarkProcessing?: boolean;
  /** Autorité média en cours de calcul → spinner au lieu du message « indisponible ». */
  authorityProcessing?: boolean;
  /** true → surface prospect : AUCUN bouton d'action (read-only strict). */
  readOnly?: boolean;
  /** CTA de déblocage benchmark (dashboard interne uniquement). */
  onUnlockClick?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(t);
  }, []);

  const bl = backlinksView(raw);
  const media = mediaView(raw);
  const bench = benchmarkView(raw);
  const hasBacklinks = bl.total > 0 || bl.domains > 0;
  const hasMedia = media.mediasCount > 0 || media.articlesCount > 0;

  // Benchmark de Barth attend SA forme de ligne. Verrouillé → rows vides.
  const barthRows: BarthCompetitorRow[] = bench.rows.map((r) => ({
    name: r.name,
    isYou: r.isYou,
    backlinks: r.ref_domains ?? 0,
    medias: r.medias ?? 0,
    presence: (r.media_details ?? []).map((d) => d.label).join(", "),
    score: r.composite ?? r.score,
  }));

  return (
    <div
      id="pilier-autorite"
      className="scroll-mt-24 rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]"
    >
      <PillarHeader icon={ICONS.header} title="Autorité médiatique de la marque" />

      {/* Score consolidé + lecture (rang omis). Machine à états : jauge serveur /
          calcul en cours / données insuffisantes. */}
      <div className="flex flex-col items-center gap-5 p-5 md:flex-row md:items-center md:gap-8 md:p-6">
        {composite != null && band ? (
          <ScoreGauge score={composite} band={band} visible={visible} gradientId="autorite-arc-grad" />
        ) : authorityProcessing ? (
          <div className="flex h-24 w-44 shrink-0 flex-col items-center justify-center gap-2.5 text-center">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-accent-pink/30 border-t-accent-pink" />
            <span className="text-[12px] font-light text-text-secondary">
              Calcul de votre autorité média…
            </span>
          </div>
        ) : (
          <div className="flex w-44 shrink-0 flex-col items-center justify-center gap-1.5 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card-inner-bg text-text-muted">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </span>
            <span className="text-[12px] font-medium text-text-secondary">Autorité média</span>
          </div>
        )}
        {/* Trophée de rang — VRAI rang benchmark concurrents (jamais un mock).
            Affiché uniquement quand le benchmark est débloqué et classé. */}
        {bench.unlocked && bench.rank > 0 && bench.total > 0 && (
          <RankBadge rank={bench.rank} outOf={bench.total} />
        )}
        <p className="flex-1 text-center text-[16px] font-light leading-relaxed text-text-secondary md:text-left">
          {composite == null && !authorityProcessing
            ? (compositeMessage ??
              "Données insuffisantes pour un score d'autorité composite défendable.")
            : "Votre autorité média reflète la qualité de vos liens entrants et votre reprise par les grands médias. Elle renforce votre crédibilité auprès des moteurs de recherche et des IA."}
        </p>
      </div>

      {/* Sous-scores : Backlinks + Grands médias (données réelles serveur). */}
      <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 md:px-6 md:pb-6">
        <SubCard icon={ICONS.backlinks} title="Backlinks">
          {authorityProcessing && !hasBacklinks ? (
            <SubComputing />
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-bold tabular-nums text-text-primary">
                  {bl.total.toLocaleString("fr-FR")}
                </span>
                <GrowthChip growth={bl.growth} />
              </div>
              <p className="mt-1 text-[14px] font-normal text-text-secondary">
                {bl.domains.toLocaleString("fr-FR")} domaines référents
              </p>
            </>
          )}
        </SubCard>

        <SubCard icon={ICONS.grandsMedias} title="Grands médias">
          {authorityProcessing && !hasMedia ? (
            <SubComputing />
          ) : (
            <>
              <div className="flex items-start">
                <div className="flex flex-col gap-0.5 pr-5">
                  <span className="text-2xl font-bold leading-none tabular-nums text-text-primary">
                    {media.mediasCount}
                  </span>
                  <span className="text-[14px] font-normal text-text-secondary">médias majeurs</span>
                </div>
                <div className="flex flex-col gap-0.5 border-l border-border-subtle pl-5">
                  <span className="text-2xl font-bold leading-none tabular-nums text-text-primary">
                    {media.articlesCount}
                  </span>
                  <span className="text-[14px] font-normal text-text-secondary">articles</span>
                </div>
              </div>
              {media.pills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {media.pills.slice(0, 3).map((p) => (
                    <span
                      key={p}
                      className="rounded-lg border border-border-subtle px-2 py-1 text-[12px] font-medium text-text-secondary"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </SubCard>
      </div>

      {/* Benchmark concurrents (langage Barth). Débloqué → table + rang ; en cours →
          spinner ; verrouillé → état verrouillé (bouton masqué en read-only prospect). */}
      <div className="mx-5 mb-4 md:mx-6">
        <BenchmarkSection
          rows={barthRows}
          clientName={clientName}
          unlocked={bench.unlocked}
          processing={benchmarkProcessing}
          readOnly={readOnly}
          onUnlockClick={onUnlockClick ?? (() => {})}
          rank={bench.rank}
          total={bench.total}
          rankHint={bench.rankHint}
        />
      </div>

      {/* Conseil — lecture de fin de bloc (texte fixe, cadre Barth). */}
      <div className="mx-5 mb-5 flex items-start gap-2.5 rounded-xl border border-accent-pink/20 bg-accent-pink/[0.06] px-4 py-3 md:mx-6 md:mb-6">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
        </svg>
        <p className="text-[16px] font-light leading-relaxed text-text-primary">
          L&apos;autorité média se construit dans la durée : croisez backlinks de qualité,
          couverture par les grands titres et calendrier éditorial régulier pour renforcer
          votre crédibilité SEO et auprès des moteurs IA.
        </p>
      </div>
    </div>
  );
}
