"use client";

// Bloc « Notoriété & autorité média » CÂBLÉ — portage fidèle du NotorieteInsights
// de Barth (composants notoriete/*, sa ligne 553 : fusionné dans l'Analyse pour
// client ET admin), mais avec NOS données réelles + le score autorité COMPOSITE
// /100 résolu côté serveur (display.value). Aucun mock.
//
// N'inclut PAS le calendrier éditorial ni le CTA média (réservés admin), comme le
// commentaire de Barth. Le benchmark suit son état natif : verrouillé si aucun
// concurrent saisi (cas Comundi).

import { useEffect, useState } from "react";
import { fetchProjectScores, type ProjectScore } from "@/lib/scores";
import {
  backlinksView,
  mediaView,
  benchmarkView,
  type NotorieteRaw,
} from "@/lib/notoriete";
import AuthorityGauge from "./notoriete/AuthorityGauge";
import BacklinksCard from "./notoriete/BacklinksCard";
import MajorMediaCard from "./notoriete/MajorMediaCard";
import BenchmarkSection from "./notoriete/BenchmarkSection";
import type { CompetitorRow as BarthCompetitorRow } from "./notoriete/data";

export default function RealNotorieteInsights({
  projectId,
  clientName,
  onUnlockClick,
}: {
  projectId: string;
  clientName: string;
  onUnlockClick?: () => void;
}) {
  const [scores, setScores] = useState<ProjectScore[] | null>(null);

  useEffect(() => {
    let active = true;
    fetchProjectScores(projectId)
      .then((s) => active && setScores(s))
      .catch(() => active && setScores([]));
    return () => {
      active = false;
    };
  }, [projectId]);

  if (scores == null) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-2xl border border-border-subtle bg-bg-card"
          />
        ))}
      </div>
    );
  }

  const noto = scores.find((s) => s.scoreType === "notoriete") ?? null;
  // Pas de score notoriété du tout → pas de section (hors-scope, pas un vide caché).
  if (!noto) return null;

  const raw = (noto.rawData ?? null) as NotorieteRaw | null;
  // Autorité média composite /100 — résolu SERVEUR. null si insufficient.
  const composite = noto.display?.scorable ? (noto.display.value ?? null) : null;
  const bl = backlinksView(raw);
  const media = mediaView(raw);
  const bench = benchmarkView(raw);

  // Benchmark de Barth (prospect) attend SA forme de ligne. Verrouillé (Comundi) →
  // rows vides + unlocked=false ; l'affichage débloqué complet suivra le contrat
  // benchmark côté back.
  const barthRows: BarthCompetitorRow[] = bench.rows.map((r) => ({
    name: r.name,
    isYou: r.isYou,
    backlinks: r.ref_domains ?? 0,
    medias: r.medias ?? 0,
    presence: (r.media_details ?? []).map((d) => d.label).join(", "),
    score: r.composite ?? r.score,
  }));

  return (
    <div>
      {/* Conseil — texte fixe de Barth (ligne 54-56). */}
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-4 py-3">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
        </svg>
        <p className="text-[length:var(--text-body)] font-light leading-relaxed text-text-primary">
          L&apos;autorité média se construit dans la durée : croisez backlinks de
          qualité, couverture par les grands titres et calendrier éditorial régulier
          pour renforcer votre crédibilité SEO et auprès des moteurs IA.
        </p>
      </div>

      {/* 3 cards diagnostic — comme Barth (AuthorityGauge / BacklinksCard / MajorMediaCard). */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {composite != null ? (
          <AuthorityGauge score={composite} delay={0} />
        ) : (
          // Composite non défendable (insufficient) : état honnête, jamais un faux /100.
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border-subtle bg-bg-card p-6 text-center backdrop-blur-[6px]">
            <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
              Autorité média
            </span>
            <p className="mt-2 text-[13px] font-light leading-relaxed text-text-muted">
              {noto.display?.message ??
                "Données insuffisantes pour un score d'autorité composite défendable."}
            </p>
          </div>
        )}
        <BacklinksCard data={bl} delay={120} />
        <MajorMediaCard data={media} delay={240} />
      </section>

      {/* Benchmark concurrents (design Barth, prospect). Verrouillé si pas de panel. */}
      <div
        className="mb-2"
        style={{
          animation: "fade-up 600ms var(--ease-expo) both",
          animationDelay: "240ms",
        }}
      >
        <BenchmarkSection
          rows={barthRows}
          clientName={clientName}
          unlocked={bench.unlocked}
          onUnlockClick={onUnlockClick ?? (() => {})}
          rank={bench.rank}
          total={bench.total}
          rankHint={bench.rankHint}
        />
      </div>
    </div>
  );
}
