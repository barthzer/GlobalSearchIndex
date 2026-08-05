"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ScoreDisplay } from "@/lib/scores";
import { bandLabel } from "@/lib/scoreLabel";
import ScoreInfoModal from "./ScoreInfoModal";
import SemanticUnlockModal from "./SemanticUnlockModal";
import Button from "./Button";
import type { ScoreInfoContent } from "@/app/dashboard/rapport/score-infos";

// Arc rendu À PARTIR du display serveur. Le front ne décide NI le régime, NI le
// scorable, NI la neutralité, NI la BANDE — il rend. La bande (rouge/ambre/vert)
// est décidée SERVEUR (display.band) : le front ne recalcule plus de seuils 50/75
// (invariant « 56 vs 12 » : un seul endroit décide). La décision « neutre » vient
// aussi du serveur (neutralArc).
//
// Le VISUEL (conteneur, arc, pastille, bouton info, badges, hover, animation
// d'entrée) reproduit au pixel le ScoreArc de la maquette Barthélemy ; seule la
// SOURCE des décisions change (buildScoreDisplay au lieu d'un recalcul de seuils).
const NEUTRAL = { start: "#9ca3af", end: "#cbd5e1" };
const BAND_GRADIENT: Record<"critical" | "medium" | "good", { start: string; end: string }> = {
  critical: { start: "#ef4444", end: "#f97316" },
  medium: { start: "#f97316", end: "#eab308" },
  good: { start: "#22c55e", end: "#4ade80" },
};

const ARC_PATH =
  "M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301";

export default function RealScoreArc({
  label,
  icon,
  display,
  info,
  badges,
  delay = 0,
  unlockable = false,
  unlockCtaLabel = "Calculer mon score sémantique",
  processing = false,
  projectId,
  onUnlocked,
}: {
  label: string;
  icon: ReactNode;
  display: ScoreDisplay;
  /** Contenu de la bulle « i » (statique, porté de la maquette). */
  info?: ScoreInfoContent;
  /** Badges optionnels en tête de carte (haut-droite). */
  badges?: ReactNode;
  /** Délai d'animation d'entrée (étagement de la grille). */
  delay?: number;
  /** Sémantique OU Autorité VERROUILLÉ : affiche la carte de déblocage (au lieu du non-scorable). */
  unlockable?: boolean;
  /** Libellé du CTA de déblocage (Sémantique vs Autorité relative). */
  unlockCtaLabel?: string;
  /** Score EN COURS de calcul : affiche « en cours », jamais « non calculable ». */
  processing?: boolean;
  /** Requis pour ouvrir le vrai SemanticUnlockModal. */
  projectId?: string;
  /** Appelé après un déblocage réussi → le parent recharge les scores (POST=repoll). */
  onUnlocked?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [computing, setComputing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const radius = 86.33;
  const circumference = Math.PI * radius;
  const gradientId = `arc-${label.replace(/\s/g, "-")}`;

  const animStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition:
      "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo), border-color 300ms var(--ease-out), background-color 300ms var(--ease-out)",
  };

  const infoButton = info ? (
    <button
      onClick={() => setShowInfo(true)}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-card-inner-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
      style={{ transitionTimingFunction: "var(--ease-out)" }}
      aria-label={`Informations sur le score ${label}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
      </svg>
    </button>
  ) : null;

  const infoModal =
    showInfo && info ? (
      <ScoreInfoModal info={info} icon={icon} onClose={() => setShowInfo(false)} />
    ) : null;

  // En-tête commun (icône + label + éventuel badge régime absolu + badges + info).
  const header = (
    <div className="mb-4 flex w-full items-center gap-2">
      <span className="text-text-primary/80">{icon}</span>
      <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
        {label}
      </span>
      {(badges || infoButton) && (
        <div className="ml-auto flex items-center gap-2">
          {badges}
          {infoButton}
        </div>
      )}
    </div>
  );

  // ⓪ SÉMANTIQUE VERROUILLÉ → carte de déblocage de la maquette Barth (gradient
  // rose + cadenas + CTA), branchée sur notre VRAI SemanticUnlockModal. Prioritaire
  // sur le non-scorable : un score « à débloquer » n'est pas un échec de mesure.
  // La carte de déblocage n'a de sens QUE si on peut réellement ouvrir la modale
  // (projectId requis). Sans lui (lecture seule /report, preview), on ne montre PAS
  // un bouton mort : on retombe sur l'affichage honnête non-scorable plus bas.
  if (unlockable && !computing && projectId) {
    return (
      <>
        {infoModal}
        {showUnlock && (
          <SemanticUnlockModal
            projectId={projectId}
            onClose={() => setShowUnlock(false)}
            onSubmit={() => {
              setShowUnlock(false);
              setComputing(true);
              // Recharge parent : semantic/geo passent en processing + benchmark
              // notoriété cascadé apparaît sans reload manuel (POST=repoll).
              onUnlocked?.();
            }}
          />
        )}
        <div
          className="group relative rounded-2xl border border-border-subtle backdrop-blur-[6px]"
          style={animStyle}
        >
          <div
            className="flex h-full flex-col items-center justify-between rounded-[calc(1rem-1px)] p-5 md:p-6"
            style={{ background: "linear-gradient(to bottom, var(--bg-card) 0%, rgba(238,86,206,0.4) 100%)" }}
          >
            {header}
            <div className="relative flex flex-1 flex-col items-center justify-center gap-4 py-4">
              {/* Arc flou en fond (langage visuel de la maquette). */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 blur-[8px] opacity-40">
                <svg viewBox="0 0 181 95" className="h-24 w-44">
                  <path d={ARC_PATH} fill="none" stroke="url(#locked-arc-grad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * 0.3} />
                  <defs>
                    <linearGradient id="locked-arc-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6817F8" />
                      <stop offset="50%" stopColor="#EE56CE" />
                      <stop offset="100%" stopColor="#EE56CE" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6817F8]/20 to-[#EE56CE]/20">
                <svg className="h-5 w-5 text-[#EE56CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <Button variant="primary" className="relative mt-1" onClick={() => setShowUnlock(true)}>
                {unlockCtaLabel}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ⓪bis Après soumission : loader « Calcul… » (pont visuel jusqu'au prochain poll
  // qui bascule le statut serveur locked → processing).
  if (unlockable && computing) {
    return (
      <>
        {infoModal}
        <div
          className="group relative flex flex-col items-center rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6"
          style={animStyle}
        >
          {header}
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
            <span className="h-11 w-11 animate-spin rounded-full border-[3.5px] border-accent-pink/20 border-t-accent-pink" />
            <span className="text-[13px] font-semibold text-text-secondary">Calcul…</span>
          </div>
        </div>
      </>
    );
  }

  // ①bis EN COURS : loader « en cours », jamais le message définitif « non
  // calculable » (un prospect qui vient de soumettre ne doit pas lire un échec).
  if (processing && (!display.scorable || display.value == null)) {
    return (
      <>
        {infoModal}
        <div
          className="group relative flex flex-col rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6"
          style={animStyle}
        >
          {header}
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
            <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-accent-pink/20 border-t-accent-pink" />
            <p className="text-[13px] leading-relaxed text-text-muted">Analyse en cours…</p>
          </div>
        </div>
      </>
    );
  }

  // ② NON SCORABLE → message, JAMAIS un chiffre (état absent de la maquette
  // d'origine : ajouté ICI dans son design system, sans réinventer).
  if (!display.scorable || display.value == null) {
    return (
      <>
        {infoModal}
        <div
          className="group relative flex flex-col rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6"
          style={animStyle}
        >
          {header}
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-inner-bg">
              <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <p className="max-w-[16rem] text-[13px] leading-relaxed text-text-muted">
              {display.message ?? "Non calculable"}
            </p>
          </div>
        </div>
      </>
    );
  }

  const value = display.value;
  // ① COULEUR : GRISE si régime neutre (absolu ou confiance réduite) — décision
  // SERVEUR (neutralArc). Sinon dégradé par bande SERVEUR. !display.band couvre
  // null ET undefined : si l'API n'envoie pas encore la bande, on retombe sur
  // neutre plutôt que de crasher.
  const col =
    display.neutralArc || !display.band ? NEUTRAL : BAND_GRADIENT[display.band];
  const pct = Math.min(Math.max(value, 0), 100) / 100;
  const offset = circumference - pct * circumference;

  return (
    <>
      {infoModal}
      <div
        className="group relative flex flex-col items-center rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] transition-all duration-300 hover:bg-bg-card-hover md:p-6"
        style={{ transitionTimingFunction: "var(--ease-out)", ...animStyle }}
      >
        {header}

        <div className="flex flex-1 flex-col items-center justify-center gap-2.5">
          <div className="relative">
            <svg viewBox="0 0 181 95" className="h-24 w-44">
              <path d={ARC_PATH} fill="none" stroke="var(--arc-bg)" strokeWidth="8" strokeLinecap="round" />
              <path
                d={ARC_PATH}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={visible ? offset : circumference}
                style={{ transition: `stroke-dashoffset 1.2s var(--ease-in-out) ${delay}ms` }}
              />
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={col.start} />
                  <stop offset="100%" stopColor={col.end} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-end justify-center">
              <span className="text-3xl font-bold tabular-nums text-text-primary">{value}</span>
              {/* Pas de « /100 » sur un BAS absolu (échelle non comparable). */}
              {!display.absolute && <span className="mb-1 text-sm text-text-muted">/100</span>}
            </div>
          </div>

          {/* Pastille d'interprétation depuis la bande SERVEUR — le front LIT
              display.band, il ne recalcule pas de seuils. Absente en régime
              absolu/neutre (band null : un BAS brut n'est pas « bon/mauvais »). */}
          {display.band && (
            <span
              className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${bandLabel(display.band).chip}`}
            >
              {bandLabel(display.band).label}
            </span>
          )}

          {/* Caveat/label du régime (confiance réduite, absolu…) — texte serveur. */}
          {display.message && (
            <p className="max-w-[18rem] text-center text-[12px] leading-relaxed text-text-muted">
              {display.message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
