"use client";

import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
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

// Dégradé de l'anneau (stops hex) par bande — repris au pixel de la maquette Barth
// (GSI-Front, GlobalScoreCard). L'éclair central reprend le même dégradé.
const BAND_GRADIENT: Record<
  "critical" | "medium" | "good",
  { start: string; end: string }
> = {
  critical: { start: "#ef4444", end: "#f97316" },
  medium: { start: "#f97316", end: "#eab308" },
  good: { start: "#22c55e", end: "#4ade80" },
};
const NEUTRAL_GRADIENT = { start: "#9ca3af", end: "#cbd5e1" };

// Éclair central de l'anneau (repère visuel du score global) — tracé maquette Barth.
const BOLT_PATH =
  "M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z";

// Libellé lisible de chaque pilier (scoreType → label) + formulation pour la phrase de
// synthèse (meilleur pilier + 2 plus faibles). Structure de la maquette Barth.
const PILLAR_LABEL: Partial<Record<ProjectScore["scoreType"], string>> = {
  seo_technical: "SEO Technique",
  geo_citations: "GEO",
  semantic: "SEO Sémantique",
  notoriete: "Autorité",
};
const PILLAR_PHRASES: Record<string, string> = {
  "SEO Technique": "votre SEO technique",
  "SEO Sémantique": "votre SEO sémantique",
  GEO: "votre visibilité GEO dans les moteurs d'IA",
  Autorité: "l'autorité de votre site",
};
const pillarPhrase = (label: string) => PILLAR_PHRASES[label] ?? label;
const pillarSubject = (label: string) => {
  const p = pillarPhrase(label);
  return p.charAt(0).toUpperCase() + p.slice(1);
};
// Ouverture de la phrase selon la bande — NOTRE décision (band-aware) : jamais un
// « bien engagée » plaqué sur un score critique. Le reste de la phrase = structure Barth.
const BAND_OPENING: Record<"critical" | "medium" | "good", string> = {
  critical: "encore fragile",
  medium: "bien engagée, mais encore inégale",
  good: "solide et homogène",
};

// Phrase d'ensemble par bande — REPLI si les valeurs par pilier ne sont pas dispo
// (validé contre les mots-tics IA). Le texte riche best/weakest prime dès qu'on a les piliers.
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
  // Id de dégradé UNIQUE par instance (évite la collision SVG si plusieurs cartes
  // coexistent — cf. maquette/preview ; en prod il n'y a qu'une carte globale, mais
  // on reste défensif). Colons de useId retirés (id SVG propre). Hook AVANT tout return.
  const gradientId = `global-arc${useId().replace(/:/g, "")}`;
  // Animation d'entrée de l'arc (même feel que les jauges piliers). Le hook vit AVANT
  // tout early return (ordre des hooks stable, cf. règle React).
  const [arcVisible, setArcVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setArcVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

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

  // État d'attente commun (anneau flouté + horloge, dégradé violet→rose) — design Barth.
  // Réutilisé pour « en cours » (③) et « attente honnête » (④), avec chip + texte propres.
  const renderPending = (chip: string, body: ReactNode) => {
    const radius = 82;
    const circumference = 2 * Math.PI * radius;
    const pendGrad = `${gradientId}-pending`;
    return (
      <div
        className="rounded-2xl border border-border-subtle backdrop-blur-[6px]"
        style={{
          opacity: arcVisible ? 1 : 0,
          transform: arcVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo)",
        }}
      >
        <div
          className="flex flex-col gap-6 rounded-[calc(1rem-1px)] p-5 md:flex-row md:items-center md:gap-10 md:p-6"
          style={{ background: "linear-gradient(to right, var(--bg-card) 55%, rgba(238,86,206,0.25) 100%)" }}
        >
          <div className="relative flex h-[180px] w-[180px] shrink-0 items-center justify-center self-center md:self-auto">
            <div className="absolute inset-0 opacity-40 blur-[8px]">
              <svg viewBox="0 0 180 180" className="h-full w-full">
                <defs>
                  <linearGradient id={pendGrad} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6817F8" />
                    <stop offset="100%" stopColor="#EE56CE" />
                  </linearGradient>
                </defs>
                <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--arc-bg)" strokeWidth={8} />
                <circle cx="90" cy="90" r={radius} fill="none" stroke={`url(#${pendGrad})`} strokeWidth={8} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * 0.4} transform="rotate(-90 90 90)" />
              </svg>
            </div>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6817F8]/20 to-[#EE56CE]/20">
              <svg className="h-5 w-5 text-[#EE56CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-2.5">
              <h2 className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Score global</h2>
              <span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
                {chip}
              </span>
            </div>
            <p className="mt-2 max-w-[520px] text-[14px] font-light leading-relaxed text-text-secondary">{body}</p>
          </div>
        </div>
      </div>
    );
  };

  // ① PRÊT : les 4 piliers portent un /100 → GRAND ANNEAU 180px + éclair central (design
  // Barth GSI-Front, choix Kevin 2026-08-27) + bande + phrase de synthèse. Tout SERVEUR :
  // le front LIT value/band, il ne recalcule NI la moyenne NI les seuils (invariant « 56 vs 12 »).
  if (result.ready && result.value != null) {
    const band = result.band;
    const value = result.value;
    const radius = 82;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min(Math.max(value, 0), 100) / 100;
    const offset = circumference - pct * circumference;
    const col = band ? BAND_GRADIENT[band] : NEUTRAL_GRADIENT;
    const ringGrad = `${gradientId}-ring`;
    const boltGrad = `${gradientId}-bolt`;

    // Phrase de synthèse : meilleur pilier + 2 plus faibles, depuis les VRAIES valeurs
    // serveur (structure Barth, notre donnée). Repli band-aware si valeurs indispo.
    const audited = scores
      .filter((s) => PILLAR_LABEL[s.scoreType] && typeof s.display?.value === "number")
      .map((s) => ({ label: PILLAR_LABEL[s.scoreType] as string, score: s.display?.value as number }))
      .sort((a, b) => b.score - a.score);
    const best = audited[0];
    const weakest = audited.slice(-2).reverse();
    const weakList = weakest.map((s) => `${pillarPhrase(s.label)} (${s.score}/100)`).join(" et ");

    return (
      <div
        className="card-ray rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]"
        style={{
          opacity: arcVisible ? 1 : 0,
          transform: arcVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo)",
        }}
      >
        <div className="flex flex-col gap-6 p-5 md:flex-row md:items-center md:gap-10 md:p-6">
          {/* Grand anneau + titre + bande */}
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left md:shrink-0">
            <div className="relative h-[180px] w-[180px] shrink-0">
              <svg viewBox="0 0 180 180" className="h-full w-full">
                <defs>
                  <linearGradient id={ringGrad} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={col.start} />
                    <stop offset="100%" stopColor={col.end} />
                  </linearGradient>
                </defs>
                <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--arc-bg)" strokeWidth={8} />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke={`url(#${ringGrad})`}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={arcVisible ? offset : circumference}
                  transform="rotate(-90 90 90)"
                  style={{ transition: "stroke-dashoffset 1200ms var(--ease-expo)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
                {/* Éclair au dégradé du score */}
                <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "var(--arc-bg)" }}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id={boltGrad} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={col.start} />
                        <stop offset="100%" stopColor={col.end} />
                      </linearGradient>
                    </defs>
                    <path fill={`url(#${boltGrad})`} d={BOLT_PATH} />
                  </svg>
                </span>
                <span className="flex items-baseline">
                  <span className="text-3xl font-bold leading-none tabular-nums text-text-primary">{value}</span>
                  <span className="ml-0.5 text-sm text-text-muted">/100</span>
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Score global</h2>
              {band && (
                <span className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${bandLabel(band).chip}`}>
                  {bandLabel(band).label}
                </span>
              )}
            </div>
          </div>

          {/* Lecture du score : meilleur pilier + ce qui freine. Structure Barth, donnée réelle. */}
          {band && best && audited.length >= 3 ? (
            <p className="flex-1 text-[14px] font-light leading-relaxed text-text-secondary md:max-w-[520px]">
              Votre visibilité est <strong className="font-medium text-text-primary">{BAND_OPENING[band]}</strong>.{" "}
              {pillarSubject(best.label)} est le pilier le plus solide ({best.score}/100) et constitue un socle sain
              pour progresser. À l&apos;inverse, {weakList}{" "}
              {weakest.length > 1 ? "tirent" : "tire"}{" "}votre moyenne vers le bas : c&apos;est là que se trouvent vos{" "}
              <strong className="font-medium text-text-primary">gains de visibilité les plus rapides</strong>.
            </p>
          ) : (
            band && (
              <p className="flex-1 text-[14px] font-light leading-relaxed text-text-secondary md:max-w-[520px]">
                {globalInterpretation(band)}
              </p>
            )
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

  // ③ EN COURS : un pilier se calcule (pas de verrou actionnable) → DESIGN CALCUL de Barth
  // (contour animé .card-ray + anneau indéterminé rose qui tourne + chip ambre « En cours de
  // calcul »), jamais un chiffre prématuré. NOTRE texte conservé (ce qui reste à calculer).
  if (anyProcessing) {
    const radius = 82;
    const circumference = 2 * Math.PI * radius;
    return (
      <div
        className="card-ray rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]"
        style={{
          opacity: arcVisible ? 1 : 0,
          transform: arcVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo)",
        }}
      >
        <div className="flex flex-col gap-6 p-5 md:flex-row md:items-center md:gap-10 md:p-6">
          <div className="relative h-[180px] w-[180px] shrink-0 self-center md:self-auto">
            <svg viewBox="0 0 180 180" className="h-full w-full">
              <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--arc-bg)" strokeWidth={8} />
              {/* Arc indéterminé qui tourne (rose brand) : le score n'est pas encore prêt. */}
              <circle
                className="animate-ring-indeterminate"
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="var(--accent-pink)"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={`${circumference * 0.28} ${circumference * 0.72}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-500">
                En cours de calcul
              </span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Score global</h2>
            <p className="mt-2 max-w-[520px] text-[14px] font-light leading-relaxed text-text-secondary">
              Votre score global est la moyenne de vos 4 piliers de visibilité. Il s&apos;affichera
              automatiquement quand ils auront tous été calculés
              {result.missing.length > 0 ? (
                <>
                  . Reste à calculer :{" "}
                  <strong className="font-medium text-text-primary">{result.missing.join(", ")}</strong>
                </>
              ) : null}
              .
            </p>
          </div>
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

  // ④ ATTENTE honnête (aucun déblocage possible, rien en cours) → anneau flouté d'attente
  // (design Barth), on dit ce qu'il manque, SANS bouton mort. (Le cas « données insuffisantes »
  // sémantique est géré en ⑤ ci-dessus.)
  return renderPending(
    "En attente",
    <>
      Votre score global sera calculé une fois les 4 piliers disponibles. En attente :{" "}
      <strong className="font-medium text-text-primary">{missingList}</strong>.
    </>,
  );
}
