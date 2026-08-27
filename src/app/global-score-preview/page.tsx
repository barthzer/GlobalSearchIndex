"use client";

// Aperçu DEV public (hors parcours) : anneau de score global 180px (design Barth) sur les
// 3 bandes + carte expert (props par défaut, wording aligné Barth). Sert de preuve visuelle
// du rendu réel des composants, sans login commercial ni données live.

import RealGlobalScoreCard from "@/components/RealGlobalScoreCard";
import ExpertCtaBanner from "@/components/ExpertCtaBanner";
import type { ProjectScore, GlobalScoreResult } from "@/lib/scores";

const mockScores: ProjectScore[] = [
  { scoreType: "seo_technical", scoreValue: 79, status: "completed", rawData: null, display: { scorable: true, value: 79 } },
  { scoreType: "geo_citability", scoreValue: 62, status: "completed", rawData: null, display: { scorable: true, value: 62 } },
  { scoreType: "authority", scoreValue: 48, status: "completed", rawData: null, display: { scorable: true, value: 48 } },
  { scoreType: "semantic", scoreValue: 70, status: "completed", rawData: null, display: { scorable: true, value: 70 } },
] as unknown as ProjectScore[];

const BANDS: { key: string; result: GlobalScoreResult }[] = [
  { key: "critical (rouge→orange)", result: { value: 32, band: "critical", ready: true, missing: [] } },
  { key: "medium (orange→jaune)", result: { value: 64, band: "medium", ready: true, missing: [] } },
  { key: "good (vert)", result: { value: 82, band: "good", ready: true, missing: [] } },
];

export default function GlobalScorePreview() {
  return (
    <main className="min-h-screen bg-bg-primary px-6 py-12 text-text-primary">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-lg font-semibold">Anneau score global (180px) + carte expert — aperçu</h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          Composants réels rendus hors dashboard : anneau sur les 3 bandes, puis carte expert
          (props par défaut, wording aligné Barth).
        </p>

        {BANDS.map((b) => (
          <section key={b.key} className="mt-8">
            <h2 className="mb-2 text-[13px] font-medium text-text-secondary">Score global — {b.key}</h2>
            <RealGlobalScoreCard result={b.result} scores={mockScores} />
          </section>
        ))}

        <section className="mt-10">
          <h2 className="mb-2 text-[13px] font-medium text-text-secondary">
            Carte expert — variante bannière (bas des vues analyse/concurrence)
          </h2>
          <ExpertCtaBanner onExpertClick={() => {}} />
        </section>

        <section className="mt-10">
          <h2 className="mb-2 text-[13px] font-medium text-text-secondary">
            Carte expert — variante sidebar (encart onglet Accueil, option B / #250)
          </h2>
          {/* Largeur ~348px = la vraie colonne sidebar de l'onglet Accueil */}
          <div className="w-[348px] max-w-full">
            <ExpertCtaBanner variant="sidebar" onExpertClick={() => {}} />
          </div>
        </section>
      </div>
    </main>
  );
}
