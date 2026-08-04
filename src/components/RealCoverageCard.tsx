"use client";

// Couverture top 10 CÂBLÉE pour la Vue d'ensemble (home) — même donnée réelle que
// l'onglet Concurrence (buildConcurrenceData depuis le score sémantique + CoverageHeatmap),
// pas le mock CoverageSection de Barth. Zéro invention : verrouillé/vide si pas de
// sémantique débloqué.

import { useEffect, useState } from "react";
import { fetchProjectScores, type ProjectScore } from "@/lib/scores";
import { buildConcurrenceData } from "@/lib/concurrence";
import CoverageHeatmap from "./concurrence/CoverageHeatmap";

function CoverShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card p-8 text-center backdrop-blur-[6px]">
      <p className="mx-auto max-w-md text-[13px] font-light leading-relaxed text-text-secondary">{children}</p>
    </div>
  );
}

export default function RealCoverageCard({
  projectId,
  clientName,
  clientInitial,
  clientLogoUrl,
}: {
  projectId: string;
  clientName: string;
  clientInitial?: string;
  clientLogoUrl?: string | null;
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
    return <div className="h-56 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />;
  }

  const semantic = scores.find((s) => s.scoreType === "semantic");
  if (!semantic || semantic.status !== "completed") {
    return (
      <CoverShell>
        Couverture SERP disponible après le déblocage de l&apos;analyse concurrentielle
        (concurrents + mots-clés).
      </CoverShell>
    );
  }

  const result = buildConcurrenceData(
    semantic.rawData as Parameters<typeof buildConcurrenceData>[0],
    clientName,
    clientInitial ?? clientName.charAt(0).toUpperCase(),
    clientLogoUrl ?? undefined,
    {},
  );
  if (!result.ok) {
    return (
      <CoverShell>
        Couverture SERP indisponible : panel de concurrents ou mots-clés exploitables
        insuffisant pour ce projet.
      </CoverShell>
    );
  }

  return <CoverageHeatmap data={result.data} />;
}
