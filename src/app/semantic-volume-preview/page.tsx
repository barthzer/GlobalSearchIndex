"use client";

// Aperçu DEV (public, hors parcours) de la pré-validation volume sémantique.
// Rend le composant RÉEL SemanticVolumeWarning (même sortie qu'en production) pour les
// 3 cas + les 3 états du bouton. Sert de preuve visuelle du rendu sans dérouler le funnel.

import SemanticVolumeWarning, { type VolumeWarning } from "@/components/SemanticVolumeWarning";
import Button from "@/components/Button";

const SparkleIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
  </svg>
);

const CASES: { title: string; warnings: VolumeWarning[] }[] = [
  {
    title: "Cas 1 — fort volume : aucun avertissement (lancement direct)",
    warnings: [],
  },
  {
    title: "Cas 2 — sous 20 recherches/mois : avertissement ambre",
    warnings: [
      { keyword: "assurance auto tous risques comparateur", volume: 11, level: "low" },
      { keyword: "meilleure mutuelle senior 2026 pas chère", volume: 6, level: "low" },
    ],
  },
  {
    title: "Cas 3 — volume inconnu (null/0) : avertissement fort (rouge)",
    warnings: [
      { keyword: "produit niche introuvable", volume: null, level: "unknown" },
      { keyword: "assurance chien npc premium", volume: 8, level: "low" },
    ],
  },
];

export default function SemanticVolumePreview() {
  return (
    <main className="min-h-screen bg-bg-primary px-6 py-12 text-text-primary">
      <div className="mx-auto max-w-md">
        <h1 className="text-lg font-semibold">Pré-validation volume — aperçu du rendu</h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          Composant réel <code>SemanticVolumeWarning</code> + états du bouton. Non bloquant : le
          prospect peut toujours « Lancer quand même ».
        </p>

        {CASES.map((c) => (
          <section key={c.title} className="mt-8">
            <h2 className="text-[13px] font-medium text-text-secondary">{c.title}</h2>
            <div className="mt-2 rounded-3xl border border-white/8 bg-bg-secondary p-4">
              <SemanticVolumeWarning warnings={c.warnings} />
              <div className="mt-3">
                <Button variant="primary" type="button" fullWidth>
                  {c.warnings.length > 0 ? "Lancer quand même" : "Calculer mon score sémantique"}
                  <SparkleIcon />
                </Button>
              </div>
            </div>
          </section>
        ))}

        <section className="mt-8">
          <h2 className="text-[13px] font-medium text-text-secondary">
            État transitoire — vérification en cours (~2s)
          </h2>
          <div className="mt-2 rounded-3xl border border-white/8 bg-bg-secondary p-4">
            <Button variant="primary" type="button" fullWidth disabled>
              Vérification des volumes…
              <SparkleIcon />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
