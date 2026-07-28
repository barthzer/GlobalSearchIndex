"use client";

import { useEffect, useState } from "react";
import {
  fetchRecommendations,
  gainIsChiffrable,
  type RecoContent,
} from "@/lib/recos";

// Impact → couleur (contrat COMEX : Fort rouge, Moyen ambre, Faible bleu).
const IMPACT_CHIP: Record<string, string> = {
  Fort: "border-red-400/30 bg-red-400/[0.08] text-red-300",
  Moyen: "border-amber-400/30 bg-amber-400/[0.08] text-amber-300",
  Faible: "border-blue-400/30 bg-blue-400/[0.08] text-blue-300",
};
const IMPACT_LABEL: Record<string, string> = {
  Fort: "Priorité élevée",
  Moyen: "Priorité moyenne",
  Faible: "Priorité faible",
};

function Heading() {
  return (
    <h2 className="mb-5 text-xl font-medium tracking-tight text-text-primary">
      Recommandations Stratégiques
    </h2>
  );
}

export default function RealRecommendations({ projectId }: { projectId: string }) {
  // undefined = chargement, null = pas de recos, sinon le contenu.
  const [content, setContent] = useState<RecoContent | null | undefined>(
    undefined,
  );
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
          Impossible de charger les recommandations — réessayez.
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
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
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
          Recommandations non disponibles pour ce projet — elles sont générées
          automatiquement dès qu&apos;au moins deux scores sont calculés.
        </div>
      </section>
    );
  }

  return (
    <section>
      <Heading />
      {content.intro && (
        <p className="mb-4 max-w-3xl text-[13.5px] leading-relaxed text-text-secondary">
          {content.intro}
        </p>
      )}
      <div className="flex flex-col gap-3">
        {content.recommendations.map((r, i) => {
          const observation = r.diagnostic || r.probleme || r.observation;
          const pillar = r.axe || r.pillar;
          return (
            <div
              key={i}
              className="rounded-2xl border border-border-subtle bg-bg-card p-5 md:p-6"
            >
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card-inner-bg text-[12px] font-semibold text-text-secondary">
                  {i + 1}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${IMPACT_CHIP[r.impact] ?? IMPACT_CHIP.Moyen}`}
                >
                  {IMPACT_LABEL[r.impact] ?? r.impact}
                </span>
                {pillar && (
                  <span className="rounded-full border border-border-subtle px-2.5 py-0.5 text-[11px] text-text-secondary">
                    {pillar}
                  </span>
                )}
              </div>

              {observation && (
                <p className="mb-3 text-[13.5px] leading-relaxed text-text-primary">
                  {observation}
                </p>
              )}
              {r.objectif && (
                <p className="mb-3 text-[13px] leading-relaxed text-text-secondary">
                  <span className="font-medium text-text-primary">Objectif :</span>{" "}
                  {r.objectif}
                </p>
              )}

              <div className="rounded-xl border border-border-subtle bg-card-inner-bg px-4 py-3">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-accent-pink">
                  Action à mener
                </div>
                <p className="text-[13px] leading-relaxed text-text-secondary">
                  {r.action}
                </p>
              </div>

              {/* Gain masqué si non chiffrable (jamais un chiffre creux). */}
              {gainIsChiffrable(r.gain) && (
                <p className="mt-2.5 text-[12.5px] text-emerald-300/80">
                  Gain estimé : {r.gain}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {content.cta && (
        <div className="mt-5 rounded-2xl border border-accent-pink/20 bg-accent-pink/[0.05] p-5 text-[13.5px] leading-relaxed text-text-secondary">
          {content.cta}
        </div>
      )}
    </section>
  );
}
