"use client";

import { useEffect, useState } from "react";
import { fetchRecommendations, type RecoContent } from "@/lib/recos";
import RealRecommendationCard from "./RealRecommendationCard";
import { useAccount } from "./AccountProvider";
import Button from "./Button";

function Heading() {
  return (
    <h2 className="mb-6 text-xl font-medium tracking-tight text-text-primary">
      Recommandations Stratégiques
    </h2>
  );
}

export default function RealRecommendations({
  projectId,
  preview = false,
  onSeeAll,
  onExpertClick,
}: {
  projectId: string;
  /** Aperçu Home : 3 recos + fondu + bouton « voir toutes » (design maquette). */
  preview?: boolean;
  onSeeAll?: () => void;
  /** CTA de déblocage du teaser prospect (funnel gratuit) → ExpertModal. */
  onExpertClick?: () => void;
}) {
  // undefined = chargement, null = pas de recos, sinon le contenu.
  const [content, setContent] = useState<RecoContent | null | undefined>(undefined);
  const [error, setError] = useState(false);
  // Funnel prospect gratuit : les recos sont FLOUTÉES (teaser conversion, P3a
  // 2026-08-07). Le déblocage passe par le rendez-vous expert (fin du funnel),
  // JAMAIS en self-serve. Le commercial voit tout en clair (isProspect=false).
  const { isProspect } = useAccount();

  useEffect(() => {
    let active = true;
    setContent(undefined);
    setError(false);
    fetchRecommendations(projectId)
      .then((c) => active && setContent(c))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [projectId]);

  if (error) {
    return (
      <section>
        <Heading />
        <p className="text-[13px] text-text-muted">
          Impossible de charger les recommandations. Réessayez.
        </p>
      </section>
    );
  }
  if (content === undefined) {
    return (
      <section>
        <Heading />
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-border-subtle bg-bg-card" />
          ))}
        </div>
      </section>
    );
  }
  // Pas de recos → on le DIT (jamais un vide silencieux).
  if (content === null || content.recommendations.length === 0) {
    return (
      <section>
        <Heading />
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-6 text-[13px] leading-relaxed text-text-muted">
          Recommandations non disponibles pour ce projet. Elles sont générées
          automatiquement dès que les scores principaux sont calculés.
        </div>
      </section>
    );
  }

  // ── Teaser prospect (funnel gratuit) : nombre + badges NETS, contenu FLOUTÉ,
  //    overlay CTA « Parler à un expert » (pattern ProjectionView). Le prospect voit
  //    qu'il y a de la matière et son urgence, jamais le plan. Déblocage = RDV expert.
  if (isProspect) {
    const total = content.recommendations.length;
    const highPriority = content.recommendations.filter((r) => r.impact === "Fort").length;
    // Quelques cartes floutées pour donner du volume visuel (jamais lisibles).
    const teaser = content.recommendations.slice(0, 5);
    return (
      <section>
        <Heading />
        {/* Résumé NET : le prospect voit le volume + l'urgence, pas le contenu. */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center rounded-full border border-border-subtle bg-bg-card px-3 py-1 text-[13px] font-medium text-text-primary">
            {total} recommandation{total > 1 ? "s" : ""}
          </span>
          {highPriority > 0 && (
            <span className="inline-flex items-center rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[13px] font-medium text-red-500">
              {highPriority} priorité élevée
            </span>
          )}
        </div>

        <div className="relative">
          {/* Contenu FLOUTÉ, non lisible et non cliquable. */}
          <div className="pointer-events-none select-none blur-[6px]" aria-hidden>
            <div className="flex flex-col gap-3">
              {teaser.map((r, i) => (
                <RealRecommendationCard key={i} rec={r} index={i} delay={0} />
              ))}
            </div>
          </div>

          {/* Overlay CTA — carte centrée, langage Barth (zéro tiret cadratin). */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="flex max-w-md flex-col items-center rounded-2xl border border-border-subtle bg-bg-overlay/85 px-8 py-8 text-center shadow-xl backdrop-blur-xl">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-accent-pink/15 bg-accent-pink/10 text-accent-pink">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-text-heading">
                Votre plan d&apos;action est prêt
              </h3>
              <p className="mt-1.5 text-[13px] font-light leading-relaxed text-text-secondary">
                Un expert AWI vous présente ces {total} recommandations priorisées et vous aide à les
                transformer en gains de visibilité concrets.
              </p>
              {onExpertClick && (
                <Button variant="primary" className="mt-5" onClick={onExpertClick}>
                  Parler à un expert
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const shown = preview ? content.recommendations.slice(0, 3) : content.recommendations;

  return (
    <section>
      <Heading />
      <div className="relative">
        <div className="flex flex-col gap-3">
          {shown.map((r, i) => (
            <RealRecommendationCard key={i} rec={r} index={i} delay={480 + i * 60} />
          ))}
        </div>
        {/* Aperçu : fondu bas comme la maquette. */}
        {preview && content.recommendations.length > shown.length && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
            style={{ background: "linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%)" }}
          />
        )}
      </div>

      {preview ? (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onSeeAll}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Voir toutes les recommandations
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      ) : (
        content.cta && (
          <div className="mt-5 rounded-2xl border border-accent-pink/20 bg-accent-pink/[0.05] p-5 text-[13.5px] leading-relaxed text-text-secondary">
            {content.cta}
          </div>
        )
      )}
    </section>
  );
}
