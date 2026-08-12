"use client";

// Vue PRÉSENTATIONNELLE « Notoriété & autorité média » — zéro fetch, tout en props.
// Source unique du rendu, partagée par :
//  - RealNotorieteInsights (dashboard interne : fetch + repoll → passe les props),
//  - /report prospect (read-only strict : props depuis le payload token).
// Le langage visuel (AuthorityGauge / BacklinksCard / MajorMediaCard / BenchmarkSection)
// est celui de Barth, identique partout (parité écran = report = PDF).

import {
  backlinksView,
  mediaView,
  benchmarkView,
  type NotorieteRaw,
} from "@/lib/notoriete";
import AuthorityGauge from "./AuthorityGauge";
import BacklinksCard from "./BacklinksCard";
import MajorMediaCard from "./MajorMediaCard";
import BenchmarkSection from "./BenchmarkSection";
import type { CompetitorRow as BarthCompetitorRow } from "./data";

export default function NotorieteInsightsView({
  raw,
  composite,
  compositeMessage,
  clientName,
  benchmarkProcessing = false,
  authorityProcessing = false,
  readOnly = false,
  onUnlockClick,
}: {
  /** raw_data du score notoriété (source des cards + benchmark). */
  raw: NotorieteRaw | null;
  /** Autorité média composite /100 résolu SERVEUR. null → carte « données insuffisantes ». */
  composite: number | null;
  /** Message serveur quand composite null (jamais un faux /100). */
  compositeMessage?: string | null;
  clientName: string;
  /** Benchmark en cours de calcul (cascade serveur) → « en cours » au lieu du verrou. */
  benchmarkProcessing?: boolean;
  /** Notoriété (autorité média) en cours de calcul → spinner au lieu du message
   *  « indisponible » (retour Kevin 2026-08-07 : montrer que le score arrive). */
  authorityProcessing?: boolean;
  /** true → surface prospect : AUCUN bouton d'action (read-only strict). */
  readOnly?: boolean;
  /** CTA de déblocage benchmark (dashboard interne uniquement). */
  onUnlockClick?: () => void;
}) {
  const bl = backlinksView(raw);
  const media = mediaView(raw);
  const bench = benchmarkView(raw);

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
    <div>
      {/* Conseil — texte fixe de Barth. */}
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-4 py-3">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
        </svg>
        <p className="text-[length:var(--text-body)] font-light leading-relaxed text-text-primary">
          L&apos;autorité média se construit dans la durée : croisez backlinks de
          qualité, couverture par les grands titres et calendrier éditorial régulier
          pour renforcer votre crédibilité SEO et auprès des moteurs IA.
        </p>
      </div>

      {/* 3 cards diagnostic (AuthorityGauge / BacklinksCard / MajorMediaCard). */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {composite != null ? (
          <AuthorityGauge score={composite} delay={0} />
        ) : authorityProcessing ? (
          // Notoriété encore en cours de calcul → un cercle qui tourne (le score
          // arrive), jamais le message « indisponible » qui fait penser à un bug.
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-bg-card p-6 text-center backdrop-blur-[6px]">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-accent-pink/30 border-t-accent-pink" />
            <span className="text-[13px] font-light text-text-secondary">
              Calcul de votre autorité média en cours…
            </span>
          </div>
        ) : (
          // Terminé mais composite non défendable (insufficient) : état honnête.
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border-subtle bg-bg-card p-6 text-center backdrop-blur-[6px]">
            <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
              Autorité média
            </span>
            <p className="mt-2 text-[13px] font-light leading-relaxed text-text-muted">
              {compositeMessage ??
                "Données insuffisantes pour un score d'autorité composite défendable."}
            </p>
          </div>
        )}
        <BacklinksCard data={bl} delay={120} />
        <MajorMediaCard data={media} delay={240} />
      </section>

      {/* Benchmark concurrents (langage Barth). Débloqué → table + rang ; en cours →
          spinner ; verrouillé → état verrouillé (bouton masqué en read-only prospect). */}
      <div
        className="mb-2"
        style={{
          animation: "fade-up 600ms var(--ease-expo) both",
          animationDelay: "240ms",
        }}
      >
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
    </div>
  );
}
