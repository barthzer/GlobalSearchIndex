"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { ScoreDisplay } from "@/lib/scores";
import type { ScoreInfoContent } from "@/app/dashboard/rapport/score-infos";
import { ScoreGauge, PillarHeader, SubCard } from "./pillar/PillarParts";
import ScoreInfoModal from "./ScoreInfoModal";
import SemanticUnlockModal from "./SemanticUnlockModal";

// CTA compacts propres à la sous-carte (le composant Button impose px-6 py-3, trop
// large ici, et sans twMerge l'override serait perdu → boutons dédiés).
const CTA_PRIMARY =
  "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#6817F8] to-[#EE56CE] px-3 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98]";
const CTA_SECONDARY =
  "inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-card-inner-bg px-3 py-1.5 text-[12px] font-medium text-text-primary transition-colors hover:bg-bg-card-hover active:scale-[0.98]";

/**
 * Bloc SEO consolidé (pilier « Visibilité dans les moteurs de recherche »).
 * Regroupe le score SEO composite (moyenne Technique + Sémantique, calculée
 * SERVEUR — le front LIT `seo`, il ne recalcule pas), les 2 sous-scores, puis
 * PageSpeed et Trafic INJECTÉS EN SLOTS (chaque surface — dashboard, prospect,
 * PDF — a ses propres sources : on ne les fond pas).
 *
 * 🔴 Invariant « moitié de mesure » (décision Kevin 2026-09-03) : tant que la
 * Sémantique n'est pas débloquée/mesurée, PAS de chiffre SEO. Le Technique seul
 * n'est JAMAIS présenté comme un score SEO (même famille que le « 100 » de kytom).
 * 3 états d'en-tête :
 *  - ready       : composite + phrase (les 2 composantes portent un /100).
 *  - locked      : déblocage honnête (le CTA vit dans la sous-carte Sémantique).
 *  - insufficient/processing : le CONSTAT du pourquoi (comme le score global),
 *    ni verrou ni chiffre.
 */

const LOUPE = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const SUB_ICONS = {
  technique: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  ),
  semantique: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
} as const;

/** Phrase de synthèse par bande (pas de tiret cadratin, style humain). */
function seoSynthesis(band: "critical" | "medium" | "good"): string {
  if (band === "good")
    return "Votre visibilité dans les moteurs de recherche est solide : la mécanique technique et votre couverture sémantique se répondent. L'enjeu est de tenir cette position dans la durée.";
  if (band === "medium")
    return "Votre visibilité dans les moteurs de recherche est correcte. Il reste de la marge, côté technique ou sur la couverture de mots-clés, pour gagner des positions.";
  return "Votre visibilité dans les moteurs de recherche est limitée. Des freins techniques et une couverture sémantique partielle pèsent sur vos positions : ce sont vos leviers prioritaires.";
}

type SeoResult = {
  value: number | null;
  band: "critical" | "medium" | "good" | null;
  ready: boolean;
  missing: string[];
};

export default function RealSeoScoreCard({
  seo,
  technique,
  semantic,
  semanticStatus = null,
  adjustmentsRemaining = null,
  projectId,
  onUnlocked,
  onExpertClick,
  infos,
  pageSpeedSlot,
  trafficSlot,
  delay = 0,
}: {
  seo: SeoResult;
  technique: ScoreDisplay | null;
  semantic: ScoreDisplay | null;
  /** Statut pipeline du sémantique (locked / processing / pending / completed / error). */
  semanticStatus?: string | null;
  /** Ajustements restants (prospect, cap 2 ; null = commercial illimité / lecture seule). */
  adjustmentsRemaining?: number | null;
  /** Absent = surface lecture seule (prospect) : pas de CTA de déblocage/ajustement. */
  projectId?: string;
  onUnlocked?: () => void;
  onExpertClick?: () => void;
  infos?: { technique?: ScoreInfoContent; semantique?: ScoreInfoContent };
  /** PageSpeed câblé par la surface (dashboard vs prospect vs PDF). */
  pageSpeedSlot?: ReactNode;
  /** Trafic câblé par la surface (RealTrafficVisibility vs ReportTrafficVisibility). */
  trafficSlot?: ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [psOpen, setPsOpen] = useState(false);
  const [openInfo, setOpenInfo] = useState<null | "technique" | "semantique">(null);
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const activeInfo = openInfo === "technique" ? infos?.technique : openInfo === "semantique" ? infos?.semantique : undefined;

  // État du sémantique → pilote l'en-tête ET la sous-carte.
  const semScorable = !!semantic && semantic.scorable && semantic.value != null;
  const isLocked = semanticStatus === "locked" && !!projectId;
  const isProcessing = semanticStatus === "processing" || semanticStatus === "pending";
  // Terminal-insuffisant : completed mais aucune valeur exploitable (le constat, pas un verrou).
  const isInsufficient = semanticStatus === "completed" && !semScorable;
  // Ajustable = insuffisant ET on peut rouvrir la modale (commercial/prospect avec projectId).
  const canAdjust = isInsufficient && !!projectId;
  const exhausted = canAdjust && adjustmentsRemaining === 0;
  const remainingSuffix =
    adjustmentsRemaining != null
      ? ` (${adjustmentsRemaining} essai${adjustmentsRemaining > 1 ? "s" : ""} restant${adjustmentsRemaining > 1 ? "s" : ""})`
      : "";

  const techScorable = !!technique && technique.scorable && technique.value != null;

  return (
    <>
      {activeInfo && openInfo && (
        <ScoreInfoModal info={activeInfo} icon={SUB_ICONS[openInfo]} onClose={() => setOpenInfo(null)} />
      )}
      {showUnlock && projectId && (
        <SemanticUnlockModal
          projectId={projectId}
          onClose={() => setShowUnlock(false)}
          onSubmit={() => {
            setShowUnlock(false);
            // Recharge parent : semantic/geo passent en processing + benchmark
            // notoriété cascadé apparaît sans reload manuel (POST=repoll).
            onUnlocked?.();
          }}
          // En ajustement, on ouvre directement sur les mots-clés (le « Retour » reste
          // dispo pour changer aussi les concurrents si le panel était mauvais).
          {...(isInsufficient
            ? { submitLabel: "Relancer avec ces mots-clés", initialStep: 2 as const }
            : {})}
        />
      )}
      <div
        id="pilier-seo"
        className="rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo)",
        }}
      >
        <PillarHeader icon={LOUPE} title="Visibilité dans les moteurs de recherche" />

        {/* En-tête : score consolidé si ready, sinon état honnête (verrou / constat). */}
        <div className="flex flex-col items-center gap-5 p-5 md:flex-row md:items-center md:gap-8 md:p-6">
          {seo.ready && seo.value != null && seo.band ? (
            <>
              <ScoreGauge score={seo.value} band={seo.band} visible={visible} gradientId="seo-arc-grad" delay={delay} />
              <p className="flex-1 text-center text-[16px] font-light leading-relaxed text-text-secondary md:text-left">
                {seoSynthesis(seo.band)}
              </p>
            </>
          ) : (
            <SeoWaitingHeader
              state={isProcessing ? "processing" : isLocked ? "locked" : isInsufficient ? "insufficient" : "incomplete"}
              message={semantic?.message ?? null}
            />
          )}
        </div>

        {/* Sous-scores : Technique (toujours son vrai score) + Sémantique (score ou état). */}
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 md:px-6 md:pb-6">
          {/* Santé technique */}
          <SubCard icon={SUB_ICONS.technique} title="Santé technique" onInfo={infos?.technique ? () => setOpenInfo("technique") : undefined}>
            <div className="flex items-center justify-center py-1">
              {techScorable && technique!.band ? (
                <ScoreGauge score={technique!.value!} band={technique!.band} visible={visible} size="sm" delay={delay + 150} gradientId="seo-sub-technique" />
              ) : (
                <SubUnavailable message={technique?.message ?? "Score technique non disponible."} />
              )}
            </div>
          </SubCard>

          {/* Contenus et mots-clés (sémantique) */}
          <SubCard icon={SUB_ICONS.semantique} title="Contenus et mots-clés" onInfo={infos?.semantique ? () => setOpenInfo("semantique") : undefined}>
            <div className="flex min-h-[96px] items-center justify-center py-1">
              {semScorable && semantic!.band ? (
                <ScoreGauge score={semantic!.value!} band={semantic!.band} visible={visible} size="sm" delay={delay + 270} gradientId="seo-sub-semantique" />
              ) : isProcessing ? (
                <div className="flex flex-col items-center gap-2 py-2 text-center">
                  <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-accent-pink/20 border-t-accent-pink" />
                  <span className="text-[12px] text-text-muted">Analyse en cours…</span>
                </div>
              ) : isLocked ? (
                <div className="flex flex-col items-center gap-2.5 py-1 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6817F8]/20 to-[#EE56CE]/20">
                    <svg className="h-4 w-4 text-[#EE56CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </span>
                  <button type="button" className={CTA_PRIMARY} onClick={() => setShowUnlock(true)}>
                    Calculer mon score sémantique
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              ) : canAdjust ? (
                <div className="flex flex-col items-center gap-2 py-2 text-center">
                  <p className="max-w-[15rem] text-[12px] leading-relaxed text-text-muted">
                    {semantic?.message ?? "Visibilité sémantique non mesurable en l'état."}
                  </p>
                  {exhausted ? (
                    <button type="button" className={CTA_SECONDARY} onClick={onExpertClick}>
                      En parler à un expert
                    </button>
                  ) : (
                    <button type="button" className={CTA_SECONDARY} onClick={() => setShowUnlock(true)}>
                      Ajuster les mots-clés{remainingSuffix}
                    </button>
                  )}
                </div>
              ) : (
                <SubUnavailable message={semantic?.message ?? "Visibilité sémantique non disponible."} />
              )}
            </div>
          </SubCard>
        </div>

        {/* Google PageSpeed — accordéon (slot injecté par la surface). */}
        {pageSpeedSlot && (
          <div className="mx-5 mb-3 rounded-2xl border border-border-subtle md:mx-6">
            <button className="flex w-full items-center justify-between px-5 py-4" onClick={() => setPsOpen((v) => !v)}>
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
                <span className="text-[14px] font-medium text-text-primary">Google PageSpeed Insights</span>
              </div>
              <svg
                className="h-4 w-4 text-text-muted transition-transform duration-300"
                style={{ transform: psOpen ? "rotate(180deg)" : "rotate(0deg)", transitionTimingFunction: "var(--ease-out)" }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300"
              style={{ gridTemplateRows: psOpen ? "1fr" : "0fr", transitionTimingFunction: "var(--ease-out)" }}
            >
              <div className={psOpen ? "" : "overflow-hidden"}>
                <div className="border-t border-border-subtle">{pageSpeedSlot}</div>
              </div>
            </div>
          </div>
        )}

        {/* Trafic (slot injecté par la surface). */}
        {trafficSlot && (
          <div className="mx-5 mb-5 rounded-2xl border border-border-subtle md:mx-6 md:mb-6">{trafficSlot}</div>
        )}
      </div>
    </>
  );
}

/** En-tête d'attente honnête (ni verrou ni chiffre pour l'insuffisant : le constat). */
function SeoWaitingHeader({
  state,
  message,
}: {
  state: "processing" | "locked" | "insufficient" | "incomplete";
  message: string | null;
}) {
  const text =
    state === "processing"
      ? "Votre score SEO se calcule : il combine votre santé technique et votre couverture sémantique."
      : state === "locked"
        ? "Votre score SEO se révèle une fois votre visibilité sémantique débloquée. Il combine votre santé technique et votre couverture de mots-clés."
        : state === "insufficient"
          ? message ??
            "Score SEO incomplet : votre visibilité sémantique n'a pas pu être mesurée en l'état. La santé technique seule ne fait pas un score SEO."
          : "Score SEO incomplet : une des deux composantes (technique ou sémantique) n'est pas disponible.";
  return (
    <div className="flex flex-1 items-center gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card-inner-bg text-text-muted">
        {state === "processing" ? (
          <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-accent-pink/20 border-t-accent-pink" />
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        )}
      </span>
      <p className="text-[15px] font-light leading-relaxed text-text-secondary">{text}</p>
    </div>
  );
}

/** Contenu compact « non disponible » d'une sous-carte. */
function SubUnavailable({ message }: { message: string }) {
  return (
    <p className="max-w-[15rem] py-3 text-center text-[12px] leading-relaxed text-text-muted">{message}</p>
  );
}
