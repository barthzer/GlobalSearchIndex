"use client";

// Aperçu DEV (public, hors parcours) des 3 régimes de comparaison sémantique
// (confidence). Les `display` ci-dessous sont la sortie EXACTE de buildScoreDisplay
// (prouvée : full → arc coloré, reduced → gris + partielle, absolute_only → gris +
// absolue). Sert à vérifier visuellement le rendu de RealScoreArc pour ces régimes.

import RealScoreArc from "@/components/RealScoreArc";
import { scoreInfos, scoreIcons } from "@/app/dashboard/rapport/score-infos";
import type { ScoreDisplay } from "@/lib/scores";

const REGIMES: { key: string; display: ScoreDisplay }[] = [
  {
    key: "full (défaut) — comparaison complète",
    display: {
      type: "semantic",
      scorable: true,
      value: 62,
      absolute: false,
      neutralArc: false,
      tone: "ok",
      band: "medium",
      label: "Fiable",
      message: null,
      caption: "Score sur 100",
    },
  },
  {
    key: "reduced — comparaison partielle (1-2 concurrents)",
    display: {
      type: "semantic",
      scorable: true,
      value: 62,
      absolute: false,
      neutralArc: true,
      tone: "warn",
      band: null,
      label: "Comparaison partielle",
      message:
        "Comparaison établie sur 2 concurrents : panel incomplet, à interpréter avec prudence.",
      caption:
        "Comparaison établie sur 2 concurrents : panel incomplet, à interpréter avec prudence.",
    },
  },
  {
    key: "absolute_only — mesure absolue (0 concurrent)",
    display: {
      type: "semantic",
      scorable: true,
      value: 62,
      absolute: false,
      neutralArc: true,
      tone: "muted",
      band: null,
      label: "Mesure absolue",
      message:
        "Aucun concurrent : votre visibilité est mesurée en absolu, sans comparaison. Ajoutez un concurrent pour situer votre position dans le secteur.",
      caption:
        "Aucun concurrent : votre visibilité est mesurée en absolu, sans comparaison. Ajoutez un concurrent pour situer votre position dans le secteur.",
    },
  },
];

export default function SemanticPreviewPage() {
  return (
    <main className="min-h-screen bg-bg-primary px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-xl font-medium text-text-primary">
          Sémantique — 3 régimes de comparaison (confidence)
        </h1>
        <p className="mb-8 text-[13px] text-text-muted">
          Aperçu du rendu RealScoreArc pour chaque régime (sortie buildScoreDisplay).
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {REGIMES.map((r, i) => (
            <div key={r.key} className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-text-secondary">
                {r.key}
              </span>
              <RealScoreArc
                label="SEO Sémantique"
                icon={scoreIcons.semantique}
                display={r.display}
                info={scoreInfos.semantique}
                delay={i * 100}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
