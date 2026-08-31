"use client";

// Aperçu DEV public (hors parcours) : les 5 ÉTATS de la carte score global rendus avec le
// composant RÉEL (RealGlobalScoreCard), sur données mock. Preuve visuelle sans login ni data
// live. Le design « calcul » de Barth s'applique à l'état ③ ; ②verrouillé, ④en attente et
// ⑤non-mesurable gardent leurs textes et leur logique (décision Kevin 28/08).

import RealGlobalScoreCard from "@/components/RealGlobalScoreCard";
import ExpertCtaBanner from "@/components/ExpertCtaBanner";
import type { ProjectScore, GlobalScoreResult } from "@/lib/scores";

const s = (
  scoreType: string,
  status: string,
  value: number | null,
  scorable = true,
): ProjectScore =>
  ({
    scoreType,
    scoreValue: value ?? 0,
    status,
    rawData: null,
    display: { scorable, value },
  }) as unknown as ProjectScore;

// Piliers tous mesurés (état prêt).
const readyScores: ProjectScore[] = [
  s("seo_technical", "completed", 79),
  s("geo_citability", "completed", 62),
  s("authority", "completed", 48),
  s("semantic", "completed", 70),
];

// ① PRÊT — 3 bandes.
const READY: { key: string; result: GlobalScoreResult }[] = [
  { key: "critical (rouge→orange)", result: { value: 32, band: "critical", ready: true, missing: [] } },
  { key: "medium (orange→jaune)", result: { value: 64, band: "medium", ready: true, missing: [] } },
  { key: "good (vert)", result: { value: 82, band: "good", ready: true, missing: [] } },
];

// ② VERROUILLÉ — sémantique + GEO verrouillés, projectId présent → CTA déblocage.
const lockedScores: ProjectScore[] = [
  s("seo_technical", "completed", 79),
  s("authority", "completed", 48),
  s("semantic", "locked", null),
  s("geo_citations", "locked", null),
];
const lockedResult: GlobalScoreResult = {
  value: null,
  band: null,
  ready: false,
  missing: ["SEO Sémantique", "GEO"],
} as unknown as GlobalScoreResult;

// ③ EN COURS — un pilier en processing (design calcul Barth : anneau indéterminé).
const computingScores: ProjectScore[] = [
  s("seo_technical", "completed", 79),
  s("authority", "completed", 48),
  s("geo_citations", "completed", 55),
  s("semantic", "processing", null),
];
const computingResult: GlobalScoreResult = {
  value: null,
  band: null,
  ready: false,
  missing: ["SEO Sémantique"],
} as unknown as GlobalScoreResult;

// ④ EN ATTENTE — un pilier manquant, rien en cours ni verrouillé ni insuffisant.
const waitingScores: ProjectScore[] = [
  s("seo_technical", "completed", 79),
  s("authority", "completed", 48),
  s("geo_citations", "completed", 55),
];
const waitingResult: GlobalScoreResult = {
  value: null,
  band: null,
  ready: false,
  missing: ["SEO Sémantique"],
} as unknown as GlobalScoreResult;

// ⑤ NON-MESURABLE Sémantique — SEO Sémantique fini mais sans /100 (terminal-insuffisant).
const insufficientScores: ProjectScore[] = [
  s("seo_technical", "completed", 79),
  s("notoriete", "completed", 48),
  s("geo_citations", "completed", 55),
  s("semantic", "completed", null, false),
];
const insufficientResult: GlobalScoreResult = {
  value: null,
  band: null,
  ready: false,
  missing: ["SEO Sémantique"],
} as unknown as GlobalScoreResult;

// ⑤bis NON-MESURABLE GEO — GEO terminal « trop peu de concurrents » (cas fyn-patrimoine
// 31/08) : geo_citations completed mais sans /100 → constat honnête, PAS « en attente ».
const geoTerminalScores: ProjectScore[] = [
  s("seo_technical", "completed", 69),
  s("notoriete", "completed", 41),
  s("semantic", "completed", 61),
  s("geo_citations", "completed", null, false),
];
const geoTerminalResult: GlobalScoreResult = {
  value: null,
  band: null,
  ready: false,
  missing: ["GEO"],
} as unknown as GlobalScoreResult;

export default function GlobalScorePreview() {
  return (
    <main className="min-h-screen bg-bg-primary px-6 py-12 text-text-primary">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-lg font-semibold">Score global — les 5 états (composant réel)</h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          Design « calcul » de Barth sur l&apos;état ③ ; ②verrouillé, ④en attente et ⑤non-mesurable
          gardent leurs textes et leur logique.
        </p>

        {READY.map((b) => (
          <section key={b.key} className="mt-8">
            <h2 className="mb-2 text-[13px] font-medium text-text-secondary">① Prêt — {b.key}</h2>
            <RealGlobalScoreCard result={b.result} scores={readyScores} />
          </section>
        ))}

        <section className="mt-10">
          <h2 className="mb-2 text-[13px] font-medium text-text-secondary">
            ② Verrouillé (déblocage concurrentiel possible)
          </h2>
          <RealGlobalScoreCard result={lockedResult} scores={lockedScores} projectId="preview" />
        </section>

        <section className="mt-10">
          <h2 className="mb-2 text-[13px] font-medium text-text-secondary">
            ③ En cours de calcul — design Barth (anneau indéterminé + contour animé)
          </h2>
          <RealGlobalScoreCard result={computingResult} scores={computingScores} />
        </section>

        <section className="mt-10">
          <h2 className="mb-2 text-[13px] font-medium text-text-secondary">④ En attente honnête</h2>
          <RealGlobalScoreCard result={waitingResult} scores={waitingScores} />
        </section>

        <section className="mt-10">
          <h2 className="mb-2 text-[13px] font-medium text-text-secondary">
            ⑤ Non-mesurable — SEO Sémantique sans /100 (terminal-insuffisant)
          </h2>
          <RealGlobalScoreCard result={insufficientResult} scores={insufficientScores} />
        </section>

        <section className="mt-10">
          <h2 className="mb-2 text-[13px] font-medium text-text-secondary">
            ⑤bis Non-mesurable — GEO terminal « trop peu de concurrents » (cas fyn-patrimoine)
          </h2>
          <RealGlobalScoreCard result={geoTerminalResult} scores={geoTerminalScores} />
        </section>

        <section className="mt-12">
          <h2 className="mb-2 text-[13px] font-medium text-text-secondary">
            Carte expert — bannière + sidebar (rappel)
          </h2>
          <ExpertCtaBanner onExpertClick={() => {}} />
          <div className="mt-6 w-[348px] max-w-full">
            <ExpertCtaBanner variant="sidebar" onExpertClick={() => {}} />
          </div>
        </section>
      </div>
    </main>
  );
}
