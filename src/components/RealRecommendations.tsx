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

// Silhouette d'une carte de reco (calquée sur RealRecommendationCard : pastille
// numéro + badges + titre + encart action). Barres neutres, jamais de faux contenu :
// c'est un gabarit visuel destiné à être flouté, pas une reco inventée.
function CardSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-card p-4">
      <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg border border-border-subtle bg-border-subtle/40" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-5 w-24 rounded-full bg-border-subtle" />
          <div className="h-5 w-20 rounded-full bg-border-subtle/70" />
        </div>
        <div className="h-4 rounded bg-border-subtle" style={{ width: titleWidth }} />
        <div className="mt-1 rounded-lg border border-card-inner-border bg-card-inner-bg px-3.5 py-2.5">
          <div className="mb-2 h-2.5 w-24 rounded bg-accent-pink/30" />
          <div className="h-3 w-2/3 rounded bg-border-subtle/70" />
        </div>
      </div>
    </div>
  );
}

// État de chargement : les recos se GÉNÈRENT (après le calcul des scores). On floute
// des cartes silhouettes et on révèle à la complétion (rendu validé Alexis 2026-08-07,
// même geste que la projection). Prospect-safe : aucun contenu lisible, aucun jargon
// fournisseur. Titre net, cartes floutées, spinner + message centrés par-dessus.
function GeneratingState() {
  return (
    <section>
      <Heading />
      <div className="relative">
        <div className="pointer-events-none select-none blur-[6px]" aria-hidden>
          <div className="flex flex-col gap-3">
            <CardSkeleton titleWidth="75%" />
            <CardSkeleton titleWidth="60%" />
            <CardSkeleton titleWidth="70%" />
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-accent-pink/25 border-t-accent-pink" />
          <div>
            <p className="text-[15px] font-semibold text-text-heading">
              Vos recommandations sont en cours d&apos;élaboration.
            </p>
            <p className="mt-1 text-[13.5px] font-light leading-relaxed text-text-secondary">
              Elles apparaîtront lorsque tous les scores seront finalisés.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const POLL_MS = 4000;
const POLL_CAP = 20; // ~80 s : au-delà, on affiche l'état « non disponibles » honnête.

export default function RealRecommendations({
  projectId,
  preview = false,
  onSeeAll,
}: {
  projectId: string;
  /** Aperçu (onglet Analyse / Home) : 3 recos + fondu + CTA « voir tout ». */
  preview?: boolean;
  /** Cible du CTA « voir tout » (bascule vers l'onglet Recommandations). */
  onSeeAll?: () => void;
}) {
  // undefined = chargement initial ; sinon le contenu (liste éventuellement vide).
  const [content, setContent] = useState<RecoContent | undefined>(undefined);
  const [error, setError] = useState(false);
  // Tentatives de poll tant que les recos sont vides (génération en cours).
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function load(n: number) {
      try {
        const c = await fetchRecommendations(projectId);
        if (!active) return;
        setContent(c);
        setError(false);
        // Vides + sous le plafond → la génération est encore en cours : on relit le
        // stocké (jamais de recalcul serveur) jusqu'à apparition ou plafond atteint.
        if (c.recommendations.length === 0 && n < POLL_CAP) {
          setAttempts(n + 1);
          timer = setTimeout(() => load(n + 1), POLL_MS);
        }
      } catch {
        if (active) setError(true);
      }
    }
    setContent(undefined);
    setError(false);
    setAttempts(0);
    load(0);
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
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

  const isEmpty = !content || content.recommendations.length === 0;

  // Flou de chargement (les deux surfaces) tant que les recos se génèrent.
  if (isEmpty && attempts < POLL_CAP) return <GeneratingState />;

  // Génération terminée sans recos → on le DIT (jamais un vide silencieux).
  if (!content || isEmpty) {
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

  const recos = content.recommendations;
  const shown = preview ? recos.slice(0, 3) : recos;

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
        {preview && recos.length > shown.length && (
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
