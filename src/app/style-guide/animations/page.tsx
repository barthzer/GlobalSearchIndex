"use client";

import { ANALYSIS_STEPS } from "@/components/AnalysisStepsFeed";
import RecoCardStack from "@/components/RecoCardStack";
import { ProcessingCycleIcon } from "@/components/ProcessingBanner";

/**
 * Page de travail : toutes les animations du produit, à plat et en boucle,
 * pour ajuster leur style sans avoir à rejouer les parcours.
 * Accessible sur /style-guide/animations (dev uniquement, non liée dans la nav).
 */
export default function AnimationsStyleGuide() {
  return (
    <div data-theme="light" className="min-h-screen bg-bg-primary px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-medium tracking-tight text-text-primary">Animations</h1>
        <p className="mt-2 text-[14px] font-light text-text-secondary">
          Toutes les scènes en boucle, figées à l&apos;état ouvert. Les états du score global se
          prévisualisent sur le dashboard : <code className="rounded bg-card-inner-bg px-1.5 py-0.5 text-[12px]">?global-computing=1</code>{" "}
          et <code className="rounded bg-card-inner-bg px-1.5 py-0.5 text-[12px]">?global-pending=1</code>.
        </p>

        {/* Scènes de l'écran d'analyse */}
        <h2 className="mb-4 mt-10 text-lg font-medium text-text-primary">
          Écran d&apos;analyse : les 4 étapes
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ANALYSIS_STEPS.map((step) => {
            const Scene = step.Scene;
            return (
              <div key={step.title} className="rounded-2xl border border-border-subtle bg-white p-4 shadow-[0_12px_32px_-16px_rgba(14,4,27,0.25)]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent-purple" />
                  <span className="text-sm font-medium text-text-primary">{step.title}</span>
                </div>
                <div className="mt-3 rounded-xl bg-black/[0.03] py-3">
                  <Scene />
                </div>
                <p className="mt-2.5 text-[12px] font-light leading-relaxed text-text-muted">{step.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* Pile de mini-cartes recommandations */}
        <h2 className="mb-4 mt-10 text-lg font-medium text-text-primary">
          Pile de recommandations (verrous)
        </h2>
        <div className="flex items-center justify-center rounded-2xl border border-border-subtle bg-bg-card py-10">
          <RecoCardStack />
        </div>

        {/* Cycle du bandeau de calcul */}
        <h2 className="mb-4 mt-10 text-lg font-medium text-text-primary">
          Bandeau « rapport en cours de calcul »
        </h2>
        <div className="flex flex-col gap-6 rounded-2xl border border-border-subtle bg-bg-card p-8">
          <div className="flex items-center gap-8">
            <ProcessingCycleIcon className="h-5 w-5" />
            <ProcessingCycleIcon className="h-8 w-8" />
            <ProcessingCycleIcon className="h-12 w-12" />
            <span className="text-[12px] font-light text-text-muted">tailles 20 / 32 / 48px</span>
          </div>
          {/* Reproduction du bandeau complet */}
          <div className="flex items-center gap-3 rounded-xl border border-accent-pink/20 bg-bg-card/90 px-4 py-3 backdrop-blur-xl">
            <ProcessingCycleIcon />
            <p className="flex-1 text-[13px] font-light leading-snug text-text-primary">
              <span className="font-medium">Votre rapport finalise ses derniers calculs.</span>{" "}
              Vous pouvez déjà explorer vos premiers résultats. Les données complètes
              s&apos;actualisent au fil de l&apos;analyse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
