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
import MediaLogo from "./MediaLogo";
import type { CompetitorRow as BarthCompetitorRow } from "./data";

export default function NotorieteInsightsView({
  raw,
  composite,
  compositeMessage,
  clientName,
  benchmarkProcessing = false,
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
  /** true → surface prospect : AUCUN bouton d'action (read-only strict). */
  readOnly?: boolean;
  /** CTA de déblocage benchmark (dashboard interne uniquement). */
  onUnlockClick?: () => void;
}) {
  const bl = backlinksView(raw);
  const media = mediaView(raw);
  const bench = benchmarkView(raw);
  // Plan éditorial (marronniers) — prospect-facing (présent dans le PDF partagé) :
  // affiché à l'écran en PARITÉ. Subtitle DYNAMIQUE (jamais un secteur en dur).
  const editorial = raw?.editorial_plan ?? null;
  const editorialSlots = editorial?.slots ?? [];

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
        ) : (
          // Composite non défendable (insufficient) : état honnête, jamais un faux /100.
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

      {/* Plan éditorial recommandé (marronniers) — parité écran = PDF. Media en
          texte (robuste à tout titre), subtitle DYNAMIQUE depuis le secteur mesuré. */}
      {editorialSlots.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xl font-medium tracking-tight text-text-primary">
            Plan éditorial recommandé
          </h3>
          {editorial?.marronniers_subtitle && (
            <p className="mt-1.5 max-w-[720px] text-[length:var(--text-body)] font-light leading-relaxed text-text-secondary">
              {editorial.marronniers_subtitle}
            </p>
          )}
          <div className="mt-5 flex flex-col gap-4">
            {editorialSlots.map((slot, i) => (
              <article
                key={i}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-border-subtle bg-bg-card p-5 md:grid-cols-[150px_minmax(0,1fr)_150px] md:items-center md:gap-5"
              >
                <div className="flex flex-col gap-2">
                  <div className="text-[15px] font-medium leading-none text-text-primary">
                    {slot.month}
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full bg-accent-pink/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-pink">
                    {slot.tag}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="mb-1.5 text-[length:var(--text-body-lg)] font-medium leading-snug tracking-tight text-text-primary">
                    {slot.title}
                  </h4>
                  <p className="text-[13px] font-light leading-relaxed text-text-secondary">
                    {slot.description}
                  </p>
                </div>
                <div className="flex flex-col gap-1 md:items-end md:text-right">
                  {/* Logo SVG du média quand dispo (figaro/bfm/lepoint/latribune),
                      sinon le nom en texte (jdn, lesechos…) — comme l'ancien GSI. */}
                  <MediaLogo
                    mediaLogo={slot.media_target ?? ""}
                    fallbackLabel={slot.media_label}
                    height={16}
                  />
                  {slot.media_subtitle && (
                    <span className="text-[11px] font-light text-text-muted">{slot.media_subtitle}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
