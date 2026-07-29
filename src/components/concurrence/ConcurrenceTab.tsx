"use client";

import { useEffect, useState } from "react";
import {
  fetchProjectScores,
  anyProcessing,
  type ProjectScore,
} from "@/lib/scores";
import {
  buildConcurrenceData,
  generateCoverageInsight,
  isCoverageDataInsufficient,
  type ConcurrenceData,
} from "@/lib/concurrence";
import ShareOfVoiceDonut from "./ShareOfVoiceDonut";
import CoverageHeatmap from "./CoverageHeatmap";
import CoverageBars from "./CoverageBars";
import CoverageRadar from "./CoverageRadar";
import CoverageBump from "./CoverageBump";
import CompetitorBadge from "./CompetitorBadge";
import SemanticUnlockModal from "../SemanticUnlockModal";

// M6 — Onglet Concurrence. Données = score sémantique (concurrents saisis +
// mots-clés). Jamais un vide silencieux : chaque cas (verrouillé, sans
// concurrent, matière insuffisante) affiche un état explicite. La SAISIE des
// concurrents (setup + génération) est le point d'entrée M5, ici différé.

type CoverageView = "heatmap" | "bars" | "radar" | "bump";
const VIEWS: { id: CoverageView; label: string }[] = [
  { id: "heatmap", label: "Heatmap" },
  { id: "bars", label: "Barres" },
  { id: "radar", label: "Radar" },
  { id: "bump", label: "Évolution" },
];

function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="animate-fade-up mx-auto max-w-2xl rounded-2xl border border-border-subtle bg-bg-card p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-card-inner-bg">
        <svg className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-medium text-text-primary">{title}</h2>
      <p className="mx-auto max-w-md text-[14px] leading-relaxed text-text-muted">{body}</p>
    </div>
  );
}

export default function ConcurrenceTab({
  projectId,
  clientName = "Votre entreprise",
  clientInitial = "V",
  clientLogoUrl = null,
}: {
  projectId: string;
  clientName?: string;
  clientInitial?: string;
  clientLogoUrl?: string | null;
}) {
  const [scores, setScores] = useState<ProjectScore[] | null>(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<CoverageView>("heatmap");
  const [setupOpen, setSetupOpen] = useState(false);
  // Incrémenté après un déblocage réussi → relance le fetch/poll des scores.
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function load() {
      try {
        const s = await fetchProjectScores(projectId);
        if (!active) return;
        setScores(s);
        setError(false);
        if (anyProcessing(s)) timer = setTimeout(load, 3000);
      } catch {
        if (active) setError(true);
      }
    }
    setScores(null);
    setError(false);
    load();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [projectId, reloadNonce]);

  if (error) {
    return <EmptyCard title="Concurrence" body="Impossible de charger l'analyse concurrentielle — réessayez." />;
  }
  if (!scores) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
        ))}
      </div>
    );
  }

  const semantic = scores.find((s) => s.scoreType === "semantic");

  // Verrouillé : le sémantique n'est pas calculé (pas de concurrents/mots-clés
  // saisis). Le déblocage est M5 → ici on l'annonce, sans chiffre factice.
  if (!semantic || semantic.status !== "completed") {
    return (
      <>
        <div className="animate-fade-up mx-auto max-w-2xl rounded-2xl border border-border-subtle bg-bg-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-card-inner-bg">
            <svg className="h-6 w-6 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-medium text-text-primary">
            Analyse concurrentielle non débloquée
          </h2>
          <p className="mx-auto mb-5 max-w-md text-[14px] leading-relaxed text-text-muted">
            Saisissez 1 à 3 concurrents et vos mots-clés pour comparer votre visibilité SERP à la leur. Si vous ne connaissez pas de concurrents, l&apos;outil vous en propose dans votre secteur.
          </p>
          <button
            type="button"
            onClick={() => setSetupOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-accent-pink px-5 py-2.5 text-[14px] font-medium text-white transition-all hover:opacity-90 active:scale-[0.97]"
          >
            Saisir / générer mes concurrents
          </button>
        </div>
        {setupOpen && (
          <SemanticUnlockModal
            projectId={projectId}
            onClose={() => setSetupOpen(false)}
            onSubmit={() => {
              setSetupOpen(false);
              setReloadNonce((n) => n + 1);
            }}
          />
        )}
      </>
    );
  }

  const result = buildConcurrenceData(
    semantic.rawData as Parameters<typeof buildConcurrenceData>[0],
    clientName,
    clientInitial,
    clientLogoUrl,
    {},
  );

  if (!result.ok) {
    return (
      <EmptyCard
        title="Analyse concurrentielle incomplète"
        body={
          result.reason === "no_competitors"
            ? "Aucun concurrent saisi pour ce projet. Ajoutez-en pour comparer votre couverture SERP."
            : "Aucun mot-clé exploitable pour ce projet. Ajoutez des requêtes recherchées pour lancer l'analyse."
        }
      />
    );
  }

  const data: ConcurrenceData = result.data;
  const insight = generateCoverageInsight(data);
  const insufficient = isCoverageDataInsufficient(data);

  return (
    <div className="animate-fade-up flex flex-col gap-6 pb-4">
      <ShareOfVoiceDonut data={data} />

      {insight && (
        <div className="rounded-2xl border border-accent-pink/20 bg-accent-pink/[0.05] p-5 text-[13.5px] leading-relaxed text-text-secondary">
          {insight}
        </div>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[length:var(--text-body-lg)] font-medium text-text-heading">
            Couverture mots-clés
          </span>
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                view === v.id
                  ? "border-accent-pink/40 bg-accent-pink/10 text-text-primary"
                  : "border-border-subtle text-text-muted hover:text-text-secondary"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Chaque viz gère son propre état « pas assez de données » (jamais un
            bloc qui disparaît). Sur matière insuffisante, l'insight ci-dessus
            l'explique déjà. */}
        {view === "heatmap" && <CoverageHeatmap data={data} />}
        {view === "bars" && <CoverageBars data={data} />}
        {view === "radar" && <CoverageRadar data={data} />}
        {view === "bump" && <CoverageBump data={data} />}
      </section>

      {!insufficient && (
        <section>
          <div className="mb-3 text-[length:var(--text-body-lg)] font-medium text-text-heading">
            Marques analysées
          </div>
          <div className="flex flex-wrap gap-2">
            {data.brands.map((b) => (
              <CompetitorBadge key={b.id} brand={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
