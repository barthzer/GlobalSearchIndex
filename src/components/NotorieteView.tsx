"use client";

import { useState } from "react";
import { useGeneration } from "./GenerationProvider";
import ExpertModal from "./ExpertModal";
import AuthorityGauge from "./notoriete/AuthorityGauge";
import BacklinksCard from "./notoriete/BacklinksCard";
import MajorMediaCard from "./notoriete/MajorMediaCard";
import BenchmarkSection from "./notoriete/BenchmarkSection";
import EditorialTimeline from "./notoriete/EditorialTimeline";
import MediaLogo from "./notoriete/MediaLogo";
import BenchmarkUnlockModal from "./notoriete/BenchmarkUnlockModal";
import {
  authorityScore,
  backlinksData,
  majorMediaData,
  rankBenchmark,
  competitorsTable,
  editorialPlan,
} from "./notoriete/data";

/**
 * Bloc « insights notoriété » réutilisable : conseil + 3 cards diagnostic + benchmark.
 * N'inclut PAS le calendrier éditorial ni le CTA média (réservés à la vue Notoriété admin).
 * Utilisé tel quel dans la vue Analyse côté client.
 */
export function NotorieteInsights() {
  const { selected: currentGeneration } = useGeneration();
  const [benchmarkUnlocked, setBenchmarkUnlocked] = useState(false);
  const [showBenchmarkUnlock, setShowBenchmarkUnlock] = useState(false);

  return (
    <div>
      {showBenchmarkUnlock && (
        <BenchmarkUnlockModal
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
          unlocked={benchmarkUnlocked}
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
  const { selected: currentGeneration } = useGeneration();
  const [showExpert, setShowExpert] = useState(false);

  return (
    <div className="animate-fade-up pb-16">
      {showExpert && <ExpertModal onClose={() => setShowExpert(false)} />}

      <NotorieteInsights />

      {/* Calendrier éditorial */}
      <div
        className="mb-20"
        style={{
          animation: "fade-up 600ms var(--ease-expo) both",
          animationDelay: "300ms",
        }}
      >
        <EditorialTimeline slots={editorialPlan} />
      </div>

      {/* CTA Plan d'activation média — wrapper relatif pour permettre à tbimg de déborder */}
      <section
        className="relative rounded-2xl"
        style={{
          animation: "fade-up 600ms var(--ease-expo) both",
          animationDelay: "700ms",
        }}
      >
        {/* Image décorative à gauche : débordant en haut et en bas, légère rotation */}
        <img
          src="/MEDIAS/tbimg.jpg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-7 hidden rounded-2xl object-cover shadow-2xl md:block"
          style={{
            top: "50%",
            width: "200px",
            height: "calc(100% + 32px)",
            zIndex: 5,
            transform: "translateY(-50%) rotate(-2deg) scale(1.05)",
            transformOrigin: "center center",
          }}
        />

        {/* Conteneur interne (overflow-hidden pour clipper le bg blur) */}
        <div className="relative overflow-hidden rounded-2xl px-6 py-7 md:px-7 md:py-8">
          {/* Image de fond blurrée */}
          <div
            className="pointer-events-none absolute inset-0 scale-110"
            style={{
              backgroundImage: "url('/MEDIAS/bgmedia.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(8px)",
            }}
          />
          {/* Subtle dark overlay pour assurer la lisibilité */}
          <div className="pointer-events-none absolute inset-0 bg-black/35" />

        <div className="relative z-10 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between md:pl-[240px]">
          <div className="flex-1">
            {/* Pill avec les 3 logos blancs — bg dark low opacity */}
            <div className="mb-4 inline-flex items-center gap-5 rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-sm">
              <MediaLogo mediaLogo="lefigaro" height={14} color="#ffffff" />
              <MediaLogo mediaLogo="bfm" height={14} color="#ffffff" />
              <MediaLogo mediaLogo="lepoint" height={14} color="#ffffff" />
            </div>

            <h3 className="mb-1.5 text-[17px] font-bold tracking-tight text-white">
              Plan d&apos;activation média recommandé
            </h3>
            <p className="max-w-[640px] text-[13px] font-light leading-relaxed text-white/85">
              Combinez émissions business, articles partenaires et tribunes expertes pour
              renforcer l&apos;autorité média, SEO et GEO de {currentGeneration.name}.
            </p>
          </div>

          <button
            onClick={() => setShowExpert(true)}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-3 text-[14px] font-bold text-accent-purple transition-all duration-200 hover:shadow-lg active:scale-[0.97]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Voir les opportunités
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
        </div>
      </section>
    </div>
  );
}
