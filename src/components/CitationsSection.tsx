"use client";

import { useState } from "react";
import type { GeoCitationsDisplay } from "@/lib/scores";
import SemanticUnlockModal from "./SemanticUnlockModal";
import { GapBanner, CompetitorBreakdownList } from "./PilierIA";

// Section « Citations par les IA » — la mesure RELATIVE au panel de concurrents
// (competitor_breakdown : « Roadsurfer 2421 · Vous 65 »), complémentaire de
// l'encart GEO (qui montre le par-moteur). Réutilise le langage visuel du pilier :
//  - verrouillé → GapBanner 'locked' (appel à débloquer l'analyse concurrentielle),
//  - completed avec panel → liste nominative + bandeau d'écart (urgence/opportunité),
//  - non mesurable → bandeau neutre. Tout est piloté par le display serveur.
export default function CitationsSection({
  geoCitations,
  projectId,
  onExpertClick,
}: {
  geoCitations: GeoCitationsDisplay;
  projectId?: string;
  onExpertClick?: () => void;
}) {
  const ctx = geoCitations.geoContext ?? null;
  const [showUnlock, setShowUnlock] = useState(false);
  const noop = () => {};

  // Pas de contexte relatif (geo_citations absent du projet) → pas de section.
  if (!ctx) return null;

  const breakdown =
    ctx.competitorBreakdown && ctx.competitorBreakdown.length > 0
      ? ctx.competitorBreakdown
      : null;

  return (
    <>
      {showUnlock && projectId && (
        <SemanticUnlockModal
          projectId={projectId}
          onClose={() => setShowUnlock(false)}
          onSubmit={() => setShowUnlock(false)}
        />
      )}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight text-text-primary">
          Citations par les IA
        </h2>

        {/* Détail nominatif vs concurrents (si le panel le fournit). */}
        {breakdown && (
          <CompetitorBreakdownList breakdown={breakdown} userPages={ctx.userPages ?? 0} />
        )}

        {/* Bandeau d'écart / déblocage — pleine largeur, piloté par frame. */}
        <GapBanner
          frame={ctx.frame}
          onExpertClick={onExpertClick ?? noop}
          onUnlock={projectId ? () => setShowUnlock(true) : undefined}
          message={geoCitations.message}
          label={geoCitations.label}
        />
      </section>
    </>
  );
}
