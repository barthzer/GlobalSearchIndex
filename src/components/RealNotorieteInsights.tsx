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
import { type NotorieteRaw } from "@/lib/notoriete";
import NotorieteInsightsView from "./notoriete/NotorieteInsightsView";

export default function RealNotorieteInsights({
  projectId,
  clientName,
  onUnlockClick,
  refreshTick,
}: {
  projectId: string;
  clientName: string;
  onUnlockClick?: () => void;
  /** Signal de refetch piloté par le parent (AnalyseTab). Incrémenté à chaque
   *  tick de polling → le benchmark cascadé côté serveur (POST /semantic →
   *  cascadeNotorieteBenchmark) apparaît sans reload manuel (POST=repoll).
   *  Optionnel : NotorieteTab (admin) ne le passe pas → comportement inchangé. */
  refreshTick?: number;
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
    // refreshTick : le parent nous demande de re-lire (déblocage / polling en cours).
  }, [projectId, refreshTick]);

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
  // Benchmark EN COURS : déblocage validé (sémantique en processing → la cascade
  // benchmark tourne côté serveur) mais pas encore débloqué. On montre « en cours »
  // au lieu du verrou (Alexis : tout doit tourner à la validation, pas de reclic).
  const benchmarkProcessing = (scores ?? []).some(
    (s) => s.scoreType === "semantic" && s.status === "processing",
  );

  return (
    <NotorieteInsightsView
      raw={raw}
      composite={composite}
      compositeMessage={noto.display?.message ?? null}
      clientName={clientName}
      benchmarkProcessing={benchmarkProcessing}
      showEditorial={false}
      onUnlockClick={onUnlockClick}
    />
  );
}
