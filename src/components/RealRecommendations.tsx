"use client";

import { useEffect, useRef, useState } from "react";
import { fetchRecommendations, type RecoContent } from "@/lib/recos";
import { fetchProjectScores, anyProcessing } from "@/lib/scores";
import RealRecommendationCard from "./RealRecommendationCard";
import RecoCardStack from "./RecoCardStack";
import ExpertCtaBanner from "./ExpertCtaBanner";

function Heading() {
  return (
    <h2 className="mb-6 text-xl font-medium tracking-tight text-text-primary">
      Recommandations Stratégiques
    </h2>
  );
}

// Silhouette d'une carte de reco (calquée sur RealRecommendationCard : pastille
// numéro + badges + titre + encart action). Barres neutres, jamais de faux contenu :
// c'est un gabarit visuel destiné à être flouté, pas une reco inventée.
function CardSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-card p-4">
      <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg border border-border-subtle bg-border-subtle/40" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-5 w-24 rounded-full bg-border-subtle" />
          <div className="h-5 w-20 rounded-full bg-border-subtle/70" />
        </div>
        <div className="h-4 rounded bg-border-subtle" style={{ width: titleWidth }} />
        <div className="mt-1 rounded-lg border border-card-inner-border bg-card-inner-bg px-3.5 py-2.5">
          <div className="mb-2 h-2.5 w-24 rounded bg-accent-pink/30" />
          <div className="h-3 w-2/3 rounded bg-border-subtle/70" />
        </div>
      </div>
    </div>
  );
}

// Cartes silhouettes floutées (fond commun aux états verrou + génération).
function BlurredCards() {
  return (
    <div className="pointer-events-none select-none blur-[6px]" aria-hidden>
      <div className="flex flex-col gap-3">
        <CardSkeleton titleWidth="75%" />
        <CardSkeleton titleWidth="60%" />
        <CardSkeleton titleWidth="70%" />
      </div>
    </div>
  );
}

// TEASER GATE EXPERT (modèle expert-first validé Alexis 2026-08-27, design Barth GSI-Front) :
// posé SOUS les 4 recos en clair, il floute un fond de SILHOUETTES (pas les vraies recos
// 5+ → aucune fuite du contenu gaté dans le DOM : notre logique derrière son pixel) et
// superpose une pile de mini-cartes animée + le CTA « Échanger avec un expert ». Remplace
// l'ancien verrou « Débloquer » (le gate n'est plus le déblocage sémantique).
export function ExpertGate({ count, onExpertClick }: { count: number; onExpertClick?: () => void }) {
  return (
    <div className="relative">
      {/* Fond flouté = silhouettes (jamais les vraies recos). */}
      <div className="pointer-events-none flex select-none flex-col gap-3 blur-[7px]" aria-hidden>
        <CardSkeleton titleWidth="72%" />
        {count > 1 && <CardSkeleton titleWidth="60%" />}
        {count > 2 && <CardSkeleton titleWidth="68%" />}
      </div>
      {/* Voile de lisibilité + encart d'accès sticky (RecoCardStack + CTA expert). */}
      <div
        className="pointer-events-none absolute inset-0 z-10 px-4"
        style={{ background: "linear-gradient(to bottom, transparent 0%, var(--bg-primary) 96%)" }}
      >
        <div className="pointer-events-auto sticky top-28 mx-auto flex w-fit max-w-[560px] flex-col items-center gap-5 px-4 py-6 text-center">
          <RecoCardStack />
          <p className="max-w-[440px] text-[18px] font-medium leading-snug tracking-[-0.2px] text-text-primary md:text-[20px]">
            Échangez avec un de nos experts pour accéder à l&apos;ensemble des recommandations.
          </p>
          <button
            onClick={onExpertClick}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6817F8] to-[#EE56CE] px-5 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Échanger avec un expert
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// État de chargement : débloqué, les recos se GÉNÈRENT. Cartes floutées + spinner +
// message centrés. Révélé à la complétion. Prospect-safe (aucun contenu lisible).
function GeneratingState() {
  return (
    <section>
      <Heading />
      <div className="relative">
        <BlurredCards />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-accent-pink/25 border-t-accent-pink" />
          <div>
            <p className="text-[15px] font-semibold text-text-heading">
              Vos recommandations sont en cours d&apos;élaboration.
            </p>
            <p className="mt-1 text-[13.5px] font-light leading-relaxed text-text-secondary">
              Elles apparaîtront lorsque tous les scores seront finalisés.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const POLL_START_MS = 4000;
const POLL_MAX_MS = 30000; // backoff doux : la génération LLM peut être longue.

export default function RealRecommendations({
  projectId,
  preview = false,
  onSeeAll,
  onExpertClick,
}: {
  projectId: string;
  /** Aperçu (onglet Analyse / Home) : 3 recos + fondu + CTA « voir tout ». */
  preview?: boolean;
  /** Cible du CTA « voir tout » (bascule vers l'onglet Recommandations). */
  onSeeAll?: () => void;
  /** Ouvre la modale expert (lead). Gate du modèle expert-first : au-delà de 4 recos,
   *  le prospect passe par le contact expert (plus le déblocage sémantique). */
  onExpertClick?: () => void;
}) {
  // undefined = chargement initial ; sinon le contenu (liste éventuellement vide).
  const [content, setContent] = useState<RecoContent | undefined>(undefined);
  // Retour COMEX 21/08 (#12) : gater l'AFFICHAGE (pas la génération) tant qu'un score
  // auto n'est pas finalisé, pour ne pas montrer des recos partielles qui « sautent »
  // quand le dernier score arrive. La génération LLM continue en fond côté serveur.
  const [autoRunning, setAutoRunning] = useState(false);
  const [error, setError] = useState(false);
  // Filtres Priorité (via impact) + Type (via pilier/axe) — parité VF, absents du
  // Barth (retour Alexis 2026-08-13). Affichés uniquement en vue complète (pas aperçu).
  const [fPriority, setFPriority] = useState<string>("all");
  const [fType, setFType] = useState<string>("all");
  // L'audience est décidée CÔTÉ SERVEUR : le payload prospect est déjà tronqué à 4 +
  // lockedCount (le commercial reçoit tout, lockedCount 0). Le front rend ce qu'il reçoit
  // — plus de check isProspect ici (décision Kevin 2026-08-27 : « l'audience détermine le
  // payload, le front rend ce qu'il reçoit »).

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let interval = POLL_START_MS;
    async function load() {
      try {
        // Scores (pour détecter un calcul auto en cours) + recos, en parallèle.
        const [scores, c] = await Promise.all([
          fetchProjectScores(projectId).catch(() => null),
          fetchRecommendations(projectId),
        ]);
        if (!active) return;
        // Un score auto encore pending/processing → on attend sa finalisation avant
        // d'afficher les recos (les scores 'locked' sémantique/geo sont ignorés par
        // anyProcessing, donc l'attente du formulaire sémantique ne bloque pas l'affichage).
        const running = scores ? anyProcessing(scores) : false;
        setAutoRunning(running);
        setContent(c);
        setError(false);
        // Poll tant que : un score auto tourne OU recos pas encore là. Lecture du stocké
        // (aucun recalcul serveur), backoff doux.
        if (running || c.recommendations.length === 0) {
          timer = setTimeout(load, interval);
          interval = Math.min(interval + 3000, POLL_MAX_MS);
        }
      } catch {
        if (active) setError(true);
      }
    }
    setContent(undefined);
    setAutoRunning(false);
    setError(false);
    load();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [projectId]);

  const isEmpty = !content || content.recommendations.length === 0;

  let body: React.ReactNode;
  if (error) {
    body = (
      <section>
        <Heading />
        <p className="text-[13px] text-text-muted">
          Impossible de charger les recommandations. Réessayez.
        </p>
      </section>
    );
  } else if (autoRunning) {
    // Un score auto se calcule encore → flou de génération, on n'affiche pas de recos
    // partielles susceptibles d'être régénérées à l'arrivée du dernier score (#12).
    body = <GeneratingState />;
  } else if (isEmpty) {
    // Débloqué mais recos pas encore là → flou de génération (ad vitam, jamais un
    // « non disponible » prématuré : la génération LLM peut être longue).
    body = <GeneratingState />;
  } else {
    const recos = content!.recommendations;
    // GATE EXPERT : le SERVEUR a déjà tronqué le payload prospect à 4 + lockedCount (le
    // reste n'est même pas dans la réponse réseau). Le front rend ce qu'il reçoit — aucun
    // re-slice, aucun check d'audience côté front (le serveur décide). gated = il reste des
    // recos masquées. Le commercial reçoit tout (lockedCount 0) → aucun gate.
    const lockedCount = content!.lockedCount ?? 0;
    const gated = !preview && lockedCount > 0;
    // Filtres + compteur : vue complète NON gatée (commercial). Le prospect n'a que 4 recos
    // → filtrer n'a pas de sens, on montre les 4 + le teaser.
    const showControls = !preview && !gated;
    // Type = piliers réellement présents dans les recos (axe = libellé dynamique).
    const typeOptions = Array.from(
      new Set(recos.map((r) => (r.pillar || r.axe || "").trim()).filter(Boolean)),
    );
    const shown = preview
      ? recos.slice(0, 3)
      : showControls
        ? recos.filter(
            (r) =>
              (fPriority === "all" || r.impact === fPriority) &&
              (fType === "all" || (r.pillar || r.axe) === fType),
          )
        : recos; // gated : les 4 recos reçues, sans filtre
    body = (
      <section>
        <Heading />
        {showControls && (
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <RecoDropdown
              label="Priorité"
              value={fPriority}
              onChange={setFPriority}
              options={[
                { value: "all", label: "Toutes" },
                { value: "Fort", label: "Élevée" },
                { value: "Moyen", label: "Moyenne" },
                { value: "Faible", label: "Faible" },
              ]}
            />
            <RecoDropdown
              label="Type"
              value={fType}
              onChange={setFType}
              options={[
                { value: "all", label: "Tous" },
                ...typeOptions.map((t) => ({ value: t, label: t })),
              ]}
            />
            <span className="text-[13px] text-text-muted">
              {shown.length} recommandation{shown.length > 1 ? "s" : ""}
              {fPriority === "all" && fType === "all" ? "" : " correspondant à vos filtres"}
            </span>
          </div>
        )}
        <div className="relative">
          {shown.length > 0 ? (
            <div className="flex flex-col gap-3">
              {shown.map((r, i) => (
                <RealRecommendationCard key={i} rec={r} index={i} delay={480 + i * 60} />
              ))}
              {/* Prospect avec des recos masquées → teaser gate expert (silhouettes floutées
                  + pile animée + CTA). Le contenu gaté n'est même PAS dans le payload. */}
              {gated && lockedCount > 0 && (
                <ExpertGate count={lockedCount} onExpertClick={onExpertClick} />
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border-subtle bg-bg-card p-8 text-center text-[14px] text-text-secondary">
              Aucune recommandation ne correspond à ces filtres.
            </div>
          )}
          {/* Aperçu : fondu bas + pile de mini-cartes animée + CTA dégradé posés sur la
              3e reco (design Barth GSI-Front, retour Alexis 27/08). */}
          {preview && recos.length > shown.length && (
            <>
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
                style={{ background: "linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%)" }}
              />
              <div
                className="animate-fade-up absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
                style={{ animationDelay: "800ms" }}
              >
                <RecoCardStack />
                <button
                  onClick={onSeeAll}
                  className="relative z-10 -mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6817F8] to-[#EE56CE] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_12px_32px_-10px_rgba(104,23,248,0.45)] transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  Voir toutes les recommandations
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {!preview && (
          // Bannière expert « 15 min offertes » (design Barth, wording confirmé Alexis 27/08),
          // posée juste après la liste/le flou — c'est là que le CTA a le plus de sens.
          <ExpertCtaBanner
            onExpertClick={onExpertClick ?? (() => {})}
            className="mt-8"
            title="Priorisez ce plan d'action avec un expert"
            body="15 minutes offertes avec un consultant AWI pour séquencer ces recommandations sur 90 jours selon votre impact business."
            cta="Bénéficier de 15 min avec un expert"
          />
        )}
      </section>
    );
  }

  return body;
}

// Menu déroulant de filtre (Priorité / Type) — calqué sur la VF (RecommendationsView).
function RecoDropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const active = value !== "all";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border py-2 pl-3.5 pr-2.5 text-[13px] font-medium transition-colors duration-200 ${
          active
            ? "border-accent-pink/50 bg-accent-pink/10 text-text-primary"
            : "border-border-subtle bg-card-inner-bg text-text-secondary hover:border-border-badge hover:text-text-primary"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <span>
          {label}
          {active && <span className="text-text-primary"> · {selected?.label}</span>}
        </span>
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""} ${active ? "text-accent-pink" : "text-text-muted"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div
        className="absolute left-0 top-full z-50 mt-2 min-w-[190px] overflow-hidden rounded-xl border border-border-subtle bg-modal-bg p-1 shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(-4px) scale(0.97)",
          pointerEvents: open ? "auto" : "none",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => { onChange(o.value); setOpen(false); }}
            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-150 hover:bg-card-inner-bg ${
              o.value === value ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            {o.label}
            {o.value === value && (
              <svg className="h-3.5 w-3.5 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
