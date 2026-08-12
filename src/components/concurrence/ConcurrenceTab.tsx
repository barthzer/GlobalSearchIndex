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
  computeRanking,
  globalInsight,
  type ConcurrenceData,
} from "@/lib/concurrence";
import RankTrophy from "../RankTrophy";
import ShareOfVoiceDonut from "./ShareOfVoiceDonut";
import CoverageHeatmap from "./CoverageHeatmap";
import CoverageBars from "./CoverageBars";
import CoverageRadar from "./CoverageRadar";
import CoverageBump from "./CoverageBump";
import CompetitorBadge from "./CompetitorBadge";
import SemanticUnlockModal from "../SemanticUnlockModal";
import ExpertCtaBanner from "../ExpertCtaBanner";

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
  isProspect = false,
  onExpertClick,
  providedScores = null,
  readOnly = false,
}: {
  projectId: string;
  clientName?: string;
  clientInitial?: string;
  clientLogoUrl?: string | null;
  // Prospect : MÊME parcours que le commercial pour débloquer le sémantique (vrai
  // formulaire SemanticUnlockModal, appels interceptés vers /public/*). La garde
  // « un seul déblocage » est SERVEUR (409). L'upsell expert se joue APRÈS le
  // déblocage, sous les résultats.
  isProspect?: boolean;
  onExpertClick?: () => void;
  // Scores fournis par le parent (vue /report token : pas de session prospect, donc
  // pas de fetchProjectScores). Si présent → on n'appelle rien, on rend tel quel.
  providedScores?: ProjectScore[] | null;
  // Lecture seule stricte (rapport partagé) : pas de bouton de déblocage (le token
  // ne permet pas d'action), on affiche un état honnête si le sémantique n'est pas là.
  readOnly?: boolean;
}) {
  const [scores, setScores] = useState<ProjectScore[] | null>(providedScores);
  const [error, setError] = useState(false);
  const [view, setView] = useState<CoverageView>("heatmap");
  const [setupOpen, setSetupOpen] = useState(false);
  // Incrémenté après un déblocage réussi → relance le fetch/poll des scores.
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    // Scores fournis (rapport partagé) : source de vérité, aucun fetch.
    if (providedScores) {
      setScores(providedScores);
      return;
    }
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
  }, [projectId, reloadNonce, providedScores]);

  if (error) {
    return <EmptyCard title="Concurrence" body="Impossible de charger l'analyse concurrentielle, réessayez." />;
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

  // EN COURS : concurrents + mots-clés déjà saisis, le sémantique calcule (Haloscan).
  // On montre un cercle qui tourne, JAMAIS « non débloquée » (qui ferait re-saisir).
  // Le polling ci-dessus (anyProcessing → re-load 3s) fait arriver les tableaux seuls.
  if (semantic && (semantic.status === "processing" || semantic.status === "pending")) {
    return (
      <div className="animate-fade-up mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-border-subtle bg-bg-card p-12 text-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-pink/30 border-t-accent-pink" />
        <h2 className="text-lg font-medium text-text-primary">Analyse concurrentielle en cours…</h2>
        <p className="max-w-md text-[14px] leading-relaxed text-text-muted">
          Nous comparons votre visibilité SERP à celle de vos concurrents sur vos mots-clés.
          Le résultat s&apos;affiche automatiquement, inutile de recharger.
        </p>
      </div>
    );
  }

  // Rapport partagé (read-only, token) : aucune action possible → si le sémantique
  // n'est pas débloqué, on l'annonce honnêtement, sans bouton (le prospect ne peut
  // pas débloquer depuis le lien partagé).
  if (readOnly && (!semantic || semantic.status !== "completed")) {
    return (
      <EmptyCard
        title="Analyse concurrentielle"
        body="L'analyse concurrentielle n'a pas encore été débloquée pour ce rapport."
      />
    );
  }

  // Verrouillé (jamais lancé) OU erreur : le sémantique n'est pas calculé. Prospect ET
  // commercial passent par le MÊME formulaire de déblocage (SemanticUnlockModal). Côté
  // prospect, les appels du modal sont interceptés vers /public/* (token prospect).
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
      {/* Ordre demandé (Alexis) : la Couverture (heatmap) d'abord, son interprétation
          JUSTE EN DESSOUS ; puis la part de clics (donut) avec SON interprétation
          dessous. Chaque interprétation sous son visuel, sections inversées. */}
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
            bloc qui disparaît). */}
        {view === "heatmap" && <CoverageHeatmap data={data} />}
        {view === "bars" && <CoverageBars data={data} />}
        {view === "radar" && <CoverageRadar data={data} />}
        {view === "bump" && <CoverageBump data={data} />}

        {/* Interprétation de la couverture — SOUS la heatmap qu'elle décrit. */}
        {insight && (
          <div className="mt-4 rounded-2xl border border-accent-pink/20 bg-accent-pink/[0.05] p-5 text-[13.5px] leading-relaxed text-text-secondary">
            {insight}
          </div>
        )}
      </section>

      {/* Part de clics estimés (donut) — porte sa propre interprétation en dessous. */}
      <ShareOfVoiceDonut data={data} />

      {/* Classement global — rang X/Y (couverture top 10 + part de voix) + synthèse.
          Bloc de la maquette Barth réintroduit dans l'onglet live (audit 2026-08-07),
          branché sur nos données réelles via computeRanking. */}
      {!insufficient && (() => {
        const { rank, total } = computeRanking(data);
        return (
          <section className="mt-6 rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
              </svg>
              <h3 className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Classement global</h3>
            </div>

            <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border-subtle bg-card-inner-bg px-6 py-4">
                <RankTrophy rank={rank} size={40} />
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tabular-nums text-text-primary">{rank}</span>
                  <span className="text-lg font-medium text-text-muted">/ {total}</span>
                </div>
              </div>
              <div className="flex flex-1 items-start gap-3 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-4 py-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
                </svg>
                <p className="text-[length:var(--text-body)] font-light leading-relaxed text-text-primary">
                  {globalInsight(data)}
                </p>
              </div>
            </div>
          </section>
        );
      })()}

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

      {/* Upsell expert POST-déblocage : le prospect a débloqué et voit ses
          résultats sémantiques → on propose « aller plus loin ». Réutilise le
          CTA expert existant (ExpertCtaBanner → ExpertModal via onExpertClick). */}
      {isProspect && onExpertClick && (
        <ExpertCtaBanner
          onExpertClick={onExpertClick}
          title="Aller plus loin : parlez à un expert"
          className="mt-2"
        />
      )}
    </div>
  );
}
