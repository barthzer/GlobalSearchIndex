"use client";

import { useEffect, useState } from "react";
import { fetchRecommendations, type RecoContent } from "@/lib/recos";
import RealRecommendationCard from "./RealRecommendationCard";

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
}: {
  projectId: string;
  /** Aperçu Home : 3 recos + fondu + bouton « voir toutes » (design maquette). */
  preview?: boolean;
  onSeeAll?: () => void;
}) {
  // undefined = chargement, null = pas de recos, sinon le contenu.
  const [content, setContent] = useState<RecoContent | null | undefined>(undefined);
  const [error, setError] = useState(false);

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
