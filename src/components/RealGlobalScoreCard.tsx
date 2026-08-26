"use client";

import { useState } from "react";
import type { GlobalScoreResult, ProjectScore } from "@/lib/scores";
import { bandLabel } from "@/lib/scoreLabel";
import SemanticUnlockModal from "./SemanticUnlockModal";
import Button from "./Button";

// Score global = agrégat des 4 piliers, en TÊTE de l'Analyse. Le chiffre et la bande
// viennent du SERVEUR (fetchGlobalScore → computeGlobalScore) : la carte LIT, elle ne
// recalcule NI la moyenne NI les seuils (invariant « 56 vs 12 »). STRICT 4 : tant que
// les 4 piliers ne portent pas tous un /100, PAS de chiffre — un état d'attente qui
// dit ce qu'il manque. Le déblocage concurrentiel (sémantique + citabilité IA) devient
// un argument de plus : même CTA que le verrou d'un pilier, langage Barth.

const BAND_GRADIENT: Record<"critical" | "medium" | "good", string> = {
  critical: "from-[#ef4444] to-[#f97316]",
  medium: "from-[#f97316] to-[#eab308]",
  good: "from-[#22c55e] to-[#4ade80]",
};

// Phrase d'ensemble par bande (langage business, validé contre les mots-tics IA).
function globalInterpretation(band: "critical" | "medium" | "good"): string {
  if (band === "good")
    return "Position d'ensemble excellente. Vos quatre piliers tirent dans le même sens : l'enjeu est de tenir cette avance.";
  if (band === "medium")
    return "Base solide, avec des leviers clairs pour passer un cap sur les piliers encore en retrait.";
  return "Plusieurs piliers demandent une action prioritaire pour redresser votre visibilité globale.";
}

export default function RealGlobalScoreCard({
  result,
  scores,
  projectId,
  onUnlocked,
}: {
  result: GlobalScoreResult | null;
  scores: ProjectScore[] | null;
  projectId?: string;
  onUnlocked?: () => void;
}) {
  const [showUnlock, setShowUnlock] = useState(false);

  // Chargement : squelette, jamais un vide (le COMEX ne doit rien voir de cassé).
  if (!result || !scores) {
    return (
      <div className="h-32 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
    );
  }

  const statusOf = (t: ProjectScore["scoreType"]) =>
    scores.find((s) => s.scoreType === t)?.status ?? null;
  const anyProcessing = scores.some(
    (s) => s.status === "processing" || s.status === "pending",
  );
  // Le score global se débloque avec l'analyse concurrentielle (sémantique +
  // citabilité IA verrouillées). On ne propose le CTA que s'il peut réellement agir
  // (un pilier VERROUILLÉ + projectId) : jamais un bouton mort (lecture seule / preview).
  const unlockable =
    !!projectId &&
    (statusOf("semantic") === "locked" || statusOf("geo_citations") === "locked");

  // Terminal-insuffisant (retour Kevin 2026-08-26, neurones.net) : le SEO Sémantique est
  // COMPLETED mais sans /100 (aucun mot-clé top 100). Il n'est NI processing NI locked →
  // il tomberait dans le « en attente » trompeur, qui promet un calcul automatique qui
  // n'arrivera JAMAIS seul (le pilier est fini). On le détecte pour dire le constat + l'action
  // (ajuster les mots-clés), au lieu d'une fausse attente. Le display serveur porte déjà
  // scorable/value : le front LIT, il ne recalcule pas de seuils.
  const semanticScore = scores.find((s) => s.scoreType === "semantic");
  const semanticTerminalInsufficient =
    semanticScore?.status === "completed" &&
    semanticScore.display?.scorable === false &&
    semanticScore.display?.value == null;

  const header = (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-card-inner-bg text-text-primary/80">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      </span>
      <div>
        <h3 className="text-[length:var(--text-body-lg)] font-semibold text-text-heading">
          Score global
        </h3>
        <p className="text-[12px] font-light text-text-muted">
          Moyenne des 4 piliers de votre visibilité
        </p>
      </div>
    </div>
  );

  // ① PRÊT : les 4 piliers portent un /100 → on affiche le chiffre + la bande serveur.
  if (result.ready && result.value != null) {
    const band = result.band;
    const value = result.value;
    return (
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-card p-5 md:flex-row md:items-center md:p-6">
        <div className="flex-1">
          {header}
          {band && (
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-text-secondary">
              {globalInterpretation(band)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline">
            <span
              className={`bg-gradient-to-br bg-clip-text text-5xl font-bold tabular-nums text-transparent ${
                band ? BAND_GRADIENT[band] : "from-slate-400 to-slate-300"
              }`}
            >
              {value}
            </span>
            <span className="ml-0.5 text-lg text-text-muted">/100</span>
          </div>
          {band && (
            <span
              className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${bandLabel(band).chip}`}
            >
              {bandLabel(band).label}
            </span>
          )}
        </div>
      </div>
    );
  }

  const missingList =
    result.missing.length > 0 ? result.missing.join(", ") : "certains piliers";

  // ② VERROUILLÉ + déblocage possible : carte de déblocage (gradient rose, langage
  // Barth), même CTA que le verrou d'un pilier. Le score global devient un argument
  // de déblocage supplémentaire.
  if (unlockable) {
    return (
      <>
        {showUnlock && projectId && (
          <SemanticUnlockModal
            projectId={projectId}
            onClose={() => setShowUnlock(false)}
            onSubmit={() => {
              setShowUnlock(false);
              onUnlocked?.();
            }}
          />
        )}
        <div className="rounded-2xl border border-border-subtle">
          <div
            className="flex flex-col items-start justify-between gap-4 rounded-[calc(1rem-1px)] p-5 md:flex-row md:items-center md:p-6"
            style={{ background: "linear-gradient(120deg, var(--bg-card) 30%, rgba(238,86,206,0.28) 100%)" }}
          >
            <div className="flex-1">
              {header}
              <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-text-secondary">
                Votre score global sera calculé une fois l&apos;analyse complète.
                Il manque : {missingList}. Débloquez l&apos;analyse concurrentielle
                pour révéler votre note d&apos;ensemble sur 100.
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowUnlock(true)}>
              Débloquer mon score global
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ③ EN COURS : un pilier se calcule (pas de verrou actionnable) → attente active,
  // jamais un chiffre prématuré.
  if (anyProcessing) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-card p-5 md:p-6">
        <div className="flex-1">{header}</div>
        <div className="flex items-center gap-3 text-[13px] text-text-secondary">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-pink/30 border-t-accent-pink" />
          Calcul en cours des piliers restants…
        </div>
      </div>
    );
  }

  // ⑤ TERMINAL-INSUFFISANT (SEO Sémantique fini mais sans note) → constat + action
  // (le bouton « Ajuster » vit sur la carte Sémantique). PAS « en attente » : rien n'arrive
  // seul. Wording validé Kevin.
  if (semanticTerminalInsufficient) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-border-subtle bg-bg-card p-5 md:p-6">
        {header}
        <p className="max-w-xl text-[13px] leading-relaxed text-text-secondary">
          Votre score d&apos;ensemble attend le SEO Sémantique. Ajustez vos
          mots-clés depuis la carte Sémantique.
        </p>
      </div>
    );
  }

  // ④ ATTENTE honnête (aucun déblocage possible, rien en cours) → on dit ce qu'il manque,
  // SANS bouton mort. (Le cas « données insuffisantes » sémantique est géré en ⑤ ci-dessus.)
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-border-subtle bg-bg-card p-5 md:p-6">
      {header}
      <p className="max-w-xl text-[13px] leading-relaxed text-text-muted">
        Votre score global sera calculé une fois les 4 piliers disponibles.
        En attente : {missingList}.
      </p>
    </div>
  );
}
