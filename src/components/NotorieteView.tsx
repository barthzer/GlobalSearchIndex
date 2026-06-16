"use client";

import { useState } from "react";
import { useGeneration } from "./GenerationProvider";
import ExpertModal from "./ExpertModal";
import AuthorityGauge from "./notoriete/AuthorityGauge";
import BacklinksCard from "./notoriete/BacklinksCard";
import MajorMediaCard from "./notoriete/MajorMediaCard";
import BenchmarkSection from "./notoriete/BenchmarkSection";
import ExpertCtaBanner from "./ExpertCtaBanner";
import SemanticUnlockModal from "./SemanticUnlockModal";
import { useSemanticInputs } from "@/lib/semanticInputs";
import {
  authorityScore,
  backlinksData,
  majorMediaData,
  rankBenchmark,
  competitorsTable,
} from "./notoriete/data";

/**
 * Bloc « insights notoriété » réutilisable : conseil + 3 cards diagnostic + benchmark.
 * N'inclut PAS le calendrier éditorial ni le CTA média (réservés à la vue Notoriété admin).
 * Utilisé tel quel dans la vue Analyse côté client.
 */
export function NotorieteInsights() {
  const { selected: currentGeneration } = useGeneration();
  const semantic = useSemanticInputs();
  const [benchmarkUnlocked, setBenchmarkUnlocked] = useState(false);
  const [showBenchmarkUnlock, setShowBenchmarkUnlock] = useState(false);

  // Lié à la modale SEO sémantique : des concurrents déjà saisis débloquent le benchmark.
  const isBenchmarkUnlocked = benchmarkUnlocked || semantic.competitors.length > 0;

  return (
    <div>
      {showBenchmarkUnlock && (
        <SemanticUnlockModal
          competitorsOnly
          submitLabel="Débloquer le benchmark"
          onClose={() => setShowBenchmarkUnlock(false)}
          onSubmit={() => {
            setShowBenchmarkUnlock(false);
            setBenchmarkUnlocked(true);
          }}
        />
      )}

      {/* Conseil — pleine largeur au-dessus des 3 cards diagnostic */}
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-4 py-3">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
        </svg>
        <p className="text-[length:var(--text-body)] font-light leading-relaxed text-text-primary">
          L&apos;autorité média se construit dans la durée : croisez backlinks de qualité, couverture par les grands titres et calendrier éditorial régulier pour renforcer votre crédibilité SEO et auprès des moteurs IA.
        </p>
      </div>

      {/* Top grid : 3 cards diagnostic — stagger géré par les cards (pattern ScoreArc) */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AuthorityGauge score={authorityScore} delay={0} />
        <BacklinksCard data={backlinksData} delay={120} />
        <MajorMediaCard data={majorMediaData} delay={240} />
      </section>

      {/* Tableau benchmark concurrents */}
      <div
        className="mb-8"
        style={{
          animation: "fade-up 600ms var(--ease-expo) both",
          animationDelay: "240ms",
        }}
      >
        <BenchmarkSection
          rows={competitorsTable}
          clientName={currentGeneration.name}
          unlocked={isBenchmarkUnlocked}
          onUnlockClick={() => setShowBenchmarkUnlock(true)}
          rank={rankBenchmark.rank}
          total={rankBenchmark.total}
          rankHint={rankBenchmark.hint}
        />
      </div>
    </div>
  );
}

export default function NotorieteView() {
  const [showExpert, setShowExpert] = useState(false);

  return (
    <div className="animate-fade-up pb-16">
      {showExpert && <ExpertModal onClose={() => setShowExpert(false)} />}

      <NotorieteInsights />

      {/* CTA expert — bannière pleine largeur */}
      <ExpertCtaBanner onExpertClick={() => setShowExpert(true)} className="mt-6" />
    </div>
  );
}
