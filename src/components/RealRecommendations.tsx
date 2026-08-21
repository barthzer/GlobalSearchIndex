"use client";

import { useEffect, useRef, useState } from "react";
import { fetchRecommendations, type RecoContent } from "@/lib/recos";
import { fetchProjectScores, anyProcessing } from "@/lib/scores";
import RealRecommendationCard from "./RealRecommendationCard";
import SemanticUnlockModal from "./SemanticUnlockModal";
import { useAccount } from "./AccountProvider";

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

// État VERROUILLÉ (maquette Alexis 2026-08-11) : cartes floutées + cadenas + CTA
// « Débloquer les recommandations » (même formulaire de déblocage que les autres
// scores). Tant que l'analyse n'est pas débloquée, le plan d'action reste verrouillé.
function LockedState({ onUnlock }: { onUnlock: () => void }) {
  return (
    <section>
      <Heading />
      <div className="relative">
        <BlurredCards />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-pink/10 text-accent-pink">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </span>
          <p className="max-w-xs text-[13.5px] font-light leading-relaxed text-text-secondary">
            Vos recommandations seront débloquées quand tous vos scores seront calculés.
          </p>
          <button
            onClick={onUnlock}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6817F8] to-[#EE56CE] px-5 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Débloquer les recommandations
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
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
}: {
  projectId: string;
  /** Aperçu (onglet Analyse / Home) : 3 recos + fondu + CTA « voir tout ». */
  preview?: boolean;
  /** Cible du CTA « voir tout » (bascule vers l'onglet Recommandations). */
  onSeeAll?: () => void;
}) {
  // undefined = chargement initial ; sinon le contenu (liste éventuellement vide).
  const [content, setContent] = useState<RecoContent | undefined>(undefined);
  // null = inconnu (avant 1er fetch) ; true = geo_citations verrouillé (analyse non débloquée).
  const [geoLocked, setGeoLocked] = useState<boolean | null>(null);
  // Retour COMEX 21/08 (#12) : gater l'AFFICHAGE (pas la génération) tant qu'un score
  // auto n'est pas finalisé, pour ne pas montrer des recos partielles qui « sautent »
  // quand le dernier score arrive. La génération LLM continue en fond côté serveur.
  const [autoRunning, setAutoRunning] = useState(false);
  const [error, setError] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  // Filtres Priorité (via impact) + Type (via pilier/axe) — parité VF, absents du
  // Barth (retour Alexis 2026-08-13). Affichés uniquement en vue complète (pas aperçu).
  const [fPriority, setFPriority] = useState<string>("all");
  const [fType, setFType] = useState<string>("all");
  // Le verrou recos ne concerne QUE le prospect (levier de conversion). Le commercial
  // voit toujours les recos, même analyse non débloquée (décision Kevin 2026-08-11).
  const { isProspect } = useAccount();

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let interval = POLL_START_MS;
    async function load() {
      try {
        // Scores (statut geo_citations = verrou de l'analyse) + recos, en parallèle.
        const [scores, c] = await Promise.all([
          fetchProjectScores(projectId).catch(() => null),
          fetchRecommendations(projectId),
        ]);
        if (!active) return;
        const geo = scores?.find((s) => s.scoreType === "geo_citations") ?? null;
        const locked = geo?.status === "locked";
        // Un score auto encore pending/processing → on attend sa finalisation avant
        // d'afficher les recos (les scores 'locked' sémantique/geo sont ignorés par
        // anyProcessing, donc l'attente du formulaire sémantique ne bloque pas l'affichage).
        const running = scores ? anyProcessing(scores) : false;
        setAutoRunning(running);
        setGeoLocked(locked);
        setContent(c);
        setError(false);
        // Poll tant que : un score auto tourne OU verrouillé (détecter le déblocage) OU
        // recos pas encore là. Lecture du stocké (aucun recalcul serveur), backoff doux.
        if (running || locked || c.recommendations.length === 0) {
          timer = setTimeout(load, interval);
          interval = Math.min(interval + 3000, POLL_MAX_MS);
        }
      } catch {
        if (active) setError(true);
      }
    }
    setContent(undefined);
    setGeoLocked(null);
    setAutoRunning(false);
    setError(false);
    load();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [projectId, reloadNonce]);

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
  } else if (geoLocked && isProspect) {
    // VERROUILLÉ (prospect uniquement) → cadenas + CTA de déblocage. Le commercial
    // voit les recos directement (pas de verrou).
    body = <LockedState onUnlock={() => setShowUnlock(true)} />;
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
    // Type = piliers réellement présents dans les recos (axe = libellé dynamique).
    const typeOptions = Array.from(
      new Set(recos.map((r) => (r.pillar || r.axe || "").trim()).filter(Boolean)),
    );
    // Aperçu : 3 premières, sans filtre. Vue complète : filtrable Priorité + Type.
    const shown = preview
      ? recos.slice(0, 3)
      : recos.filter(
          (r) =>
            (fPriority === "all" || r.impact === fPriority) &&
            (fType === "all" || (r.pillar || r.axe) === fType),
        );
    body = (
      <section>
        <Heading />
        {!preview && (
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
            </div>
          ) : (
            <div className="rounded-xl border border-border-subtle bg-bg-card p-8 text-center text-[14px] text-text-secondary">
              Aucune recommandation ne correspond à ces filtres.
            </div>
          )}
          {/* Aperçu : fondu bas comme la maquette. */}
          {preview && recos.length > shown.length && (
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
              style={{ background: "linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%)" }}
            />
          )}
        </div>

        {preview ? (
          <div className="mt-4 flex justify-center">
            <button
              onClick={onSeeAll}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Voir toutes les recommandations
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        ) : (
          content!.cta && (
            <div className="mt-5 mb-8 rounded-2xl border border-accent-pink/20 bg-accent-pink/[0.05] p-5 text-[13.5px] leading-relaxed text-text-secondary">
              {content!.cta}
            </div>
          )
        )}
      </section>
    );
  }

  return (
    <>
      {showUnlock && (
        <SemanticUnlockModal
          projectId={projectId}
          onClose={() => setShowUnlock(false)}
          onSubmit={() => {
            setShowUnlock(false);
            setReloadNonce((n) => n + 1);
          }}
        />
      )}
      {body}
    </>
  );
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
