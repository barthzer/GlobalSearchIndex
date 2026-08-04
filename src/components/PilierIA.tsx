"use client";

import type {
  ScoreDisplay,
  GeoContext,
  GeoCitationsDisplay,
  CompetitorBreakdownEntry,
} from "@/lib/scores";
import { useState } from "react";
import RealScoreArc from "./RealScoreArc";
import ExpertCtaBanner from "./ExpertCtaBanner";
import SemanticUnlockModal from "./SemanticUnlockModal";
import { prettyDomain } from "@/lib/domain";

// Types remontés dans src/lib/scores.ts (source unique). Ré-export pour ne pas
// casser les imports existants (`import PilierIA, { GeoCitationsDisplay }`).
export type { GeoContext, GeoCitationsDisplay, CompetitorBreakdownEntry };

// ─────────────────────────────────────────────────────────────────────────────
// Pilier IA — DEUX ARCS côte à côte (Lisibilité par les IA + Citations par les IA)
// et, EN DESSOUS, le BANDEAU D'ÉCART pleine largeur qui DOMINE le bloc.
//
// Contrat serveur (branche geo-citations, non mergée ici) :
//  - `geoCitability` : ScoreDisplay /100 classique (value, band, tone) → arc GAUCHE.
//  - `geoCitations`  : ScoreDisplay dédié → arc DROITE. Quand scorable=false, on
//    n'affiche JAMAIS 0/100 : RealScoreArc rend déjà l'état qualitatif (label +
//    message). Le CONTEXTE RELATIF vient de `geoContext`, rendu au MÊME niveau
//    visuel que le chiffre (jamais le chiffre seul).
//
// Le front NE décide RIEN (ni scorable, ni band, ni frame) : il rend le display.
// ─────────────────────────────────────────────────────────────────────────────

// Nom lisible du domaine : voir `prettyDomain` (src/lib/domain.ts), source
// partagée avec ConcurrenceView/benchmark. Purement cosmétique : le tri se fait
// sur citedPages, jamais sur le nom affiché.

// Icône partagée par les deux arcs (langage visuel du pilier, cohérent AnalyseTab).
function iaIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
      />
    </svg>
  );
}

// Bandeau d'écart : LE bloc dominant, pleine largeur, sous les deux arcs. Piloté
// EXCLUSIVEMENT par geoContext.frame. Réutilise ExpertCtaBanner (accent-pink) en
// 'urgence' — aucun nouveau langage visuel introduit.
export function GapBanner({
  frame,
  onExpertClick,
  onUnlock,
  message,
  label,
}: {
  frame: GeoContext["frame"];
  onExpertClick: () => void;
  // Absent (lecture seule /report, preview) → carte verrouillée sans bouton.
  onUnlock?: () => void;
  // Message/label SPÉCIFIQUES à l'état (résolus serveur) — utilisés dans le cadre
  // neutre 'technique'/null pour ne pas afficher un texte permanent trompeur sur
  // un état transitoire (ex. Ahrefs momentanément indisponible → « réessayez »).
  message?: string | null;
  label?: string | null;
}) {
  // 'locked' → pré-déblocage : carte d'APPEL À L'ACTION (pas un échec de mesure).
  // Réutilise le langage visuel 'opportunite' (accent-pink doux) + un vrai CTA de
  // déblocage. C'est ce qui donne envie plutôt qu'un vide/erreur technique.
  if (frame === "locked") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-accent-pink/20 bg-accent-pink/[0.06] px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-pink/10 text-accent-pink">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 0h10.5a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-6.75a2.25 2.25 0 0 1 2.25-2.25Z" />
            </svg>
          </span>
          <div>
            <h3 className="text-[17px] font-semibold leading-tight text-text-heading">
              Mesurez vos citations par les IA
            </h3>
            <p className="mt-1 max-w-[46rem] text-[13px] leading-relaxed text-text-secondary">
              Débloquez l&apos;analyse concurrentielle pour comparer, page à page,
              ce que les moteurs de réponse IA citent chez vos concurrents et chez
              vous.
            </p>
          </div>
        </div>
        {onUnlock && (
          <button
            type="button"
            onClick={onUnlock}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent-pink px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90"
          >
            Débloquer l&apos;analyse concurrentielle
          </button>
        )}
      </div>
    );
  }

  // 'urgence' → l'argumentaire le plus fort : la bannière experte accent-pink,
  // celle-là même déjà utilisée en bas des vues client. Aucun style inventé.
  if (frame === "urgence") {
    return (
      <ExpertCtaBanner
        onExpertClick={onExpertClick}
        title="Vos concurrents récoltent les citations. Pas vous."
        body="Votre site est fait pour être repris par les IA, mais ce sont vos concurrents qui décrochent les citations. Un expert AWI identifie pourquoi et comment renverser l'écart."
        cta="Parler à un expert"
      />
    );
  }

  // 'opportunite' → ton plus doux, même carte/tokens (bg-bg-card, accent-pink léger).
  if (frame === "opportunite") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-accent-pink/20 bg-accent-pink/[0.06] px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-pink/10 text-accent-pink">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          </span>
          <div>
            <h3 className="text-[17px] font-semibold leading-tight text-text-heading">
              Une place à prendre
            </h3>
            <p className="mt-1 max-w-[46rem] text-[13px] leading-relaxed text-text-secondary">
              Personne dans votre secteur n&apos;est encore cité par les IA. La
              première marque à structurer son contenu prend l&apos;avantage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 'technique' ou null → neutre : note factuelle discrète. On affiche le message
  // SPÉCIFIQUE à l'état (résolu serveur) s'il existe — « momentanément indisponible,
  // réessayez » pour une panne Ahrefs, « comparaison indisponible » pour un panel
  // trop court, etc. — jamais un texte permanent trompeur. Repli générique sinon.
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-bg-card px-6 py-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card-inner-bg text-text-muted">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      </span>
      <div>
        {/* Label seulement s'il accompagne un message spécifique (état non
            concluant) — pour ne rien changer au cas completed (message null). */}
        {label && message && (
          <div className="text-[13px] font-semibold text-text-heading">{label}</div>
        )}
        <p className="text-[13px] leading-relaxed text-text-secondary">
          {message ??
            "La citabilité par les IA n'a pas pu être mesurée sur ce panel. Aucun écart concurrentiel à interpréter pour l'instant."}
        </p>
      </div>
    </div>
  );
}

// Détail nominatif par concurrent — reprend LE langage visuel de
// BenchmarkSection (ligne « vous » surlignée bg-accent-pink/[0.08] +
// shadow-[inset_3px_0_0], valeurs tabular-nums). Aucun style nouveau. Argument
// « Roadsurfer : 2226 pages citées · Vous : 0 » face à une médiane anonyme.
export function CompetitorBreakdownList({
  breakdown,
  userPages,
}: {
  breakdown: CompetitorBreakdownEntry[];
  userPages: number;
}) {
  // Concurrents exclus (rank null) : hors classement, affichés « non mesuré »
  // en fin de liste — JAMAIS comptés comme 0 dans le rang de « Vous ».
  const measured = breakdown.filter((c) => !c.excluded);
  const excluded = breakdown.filter((c) => c.excluded);
  // Trie les mesurés par pages citées desc, insère « Vous » à son rang réel.
  const competitors = [...measured].sort((a, b) => b.citedPages - a.citedPages);
  const rows: {
    name: string;
    citedPages: number;
    isYou: boolean;
    excluded?: boolean;
  }[] = [];
  let inserted = false;
  for (const c of competitors) {
    if (!inserted && userPages >= c.citedPages) {
      rows.push({ name: "Vous", citedPages: userPages, isYou: true });
      inserted = true;
    }
    rows.push({ name: prettyDomain(c.domain), citedPages: c.citedPages, isYou: false });
  }
  if (!inserted) {
    rows.push({ name: "Vous", citedPages: userPages, isYou: true });
  }
  // Concurrents exclus en fin de liste, grisés « non mesuré ».
  for (const c of excluded) {
    rows.push({ name: prettyDomain(c.domain), citedPages: 0, isYou: false, excluded: true });
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-text-primary/80">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        </span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
          Pages citées par les IA
        </span>
      </div>
      <ul className="flex flex-col">
        {rows.map((row, idx) => (
          <li
            key={`${row.name}-${idx}`}
            className={`flex items-center justify-between gap-3 border-b border-border-subtle px-3 py-3 last:border-b-0 ${
              row.isYou
                ? "bg-accent-pink/[0.08] shadow-[inset_3px_0_0_var(--gsi-accent-pink)]"
                : ""
            }`}
          >
            <span
              className={`text-[14px] ${
                row.isYou
                  ? "font-semibold text-text-primary"
                  : row.excluded
                    ? "text-text-muted"
                    : "text-text-secondary"
              }`}
            >
              {row.name}
            </span>
            {row.excluded ? (
              <span className="text-[13px] italic text-text-muted">non mesuré</span>
            ) : (
              <span
                className={`text-[14px] tabular-nums ${
                  row.isYou ? "font-semibold text-text-primary" : "text-text-secondary"
                }`}
              >
                <span className="font-semibold">{row.citedPages}</span>{" "}
                <span className="text-[12px] font-light text-text-muted">pages citées</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function PilierIA({
  geoCitability,
  geoCitations,
  projectId,
  onExpertClick,
  className = "",
}: {
  // Arc GAUCHE — Lisibilité (display /100 classique).
  geoCitability: ScoreDisplay;
  // Arc DROITE — Citations (display + geoContext).
  geoCitations: GeoCitationsDisplay;
  // Ouvre le déblocage sémantique depuis l'état verrouillé. Optionnel : les
  // contextes lecture seule (rapport prospect /report, preview) ne le passent
  // pas → carte verrouillée informative SANS bouton d'action.
  projectId?: string;
  onExpertClick?: () => void;
  className?: string;
}) {
  const ctx = geoCitations.geoContext ?? null;
  const noop = () => {};
  const [showUnlock, setShowUnlock] = useState(false);
  // Pré-déblocage : la moitié Citations est relative au panel de concurrents, pas
  // encore saisi. État verrouillé PROPRE (appel à l'action), piloté par le serveur
  // (frame='locked') — jamais confondu avec un échec de mesure.
  const isLocked = ctx?.frame === "locked";
  // Détail nominatif présent et non vide → liste par concurrent ; sinon repli agrégat.
  const breakdown =
    ctx?.competitorBreakdown && ctx.competitorBreakdown.length > 0
      ? ctx.competitorBreakdown
      : null;

  return (
    <>
    {showUnlock && projectId && (
      <SemanticUnlockModal
        projectId={projectId}
        onClose={() => setShowUnlock(false)}
        onSubmit={() => setShowUnlock(false)}
      />
    )}
    <section className={`flex flex-col gap-4 ${className}`}>
      {/* ── Deux arcs CÔTE À CÔTE ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* GAUCHE : Lisibilité par les IA */}
        <div className="flex flex-col">
          <RealScoreArc
            label="Lisibilité par les IA"
            icon={iaIcon()}
            display={geoCitability}
          />
          <p className="mt-2 px-1 text-center text-[12px] text-text-muted">
            Structuré pour être repris.
          </p>
        </div>

        {/* DROITE : Citations par les IA — RealScoreArc gère lui-même le non-scorable
            (il affiche le message, JAMAIS 0/100). On surface l'état qualitatif
            (label) en pastille, et TOUJOURS le contexte relatif au même niveau
            visuel que le chiffre. */}
        <div className="flex flex-col">
          <RealScoreArc
            label="Citations par les IA"
            icon={iaIcon()}
            display={geoCitations}
          />
          <div className="mt-2 flex flex-col items-center gap-1.5 px-1 text-center">
            {/* État qualitatif quand non scorable : le label serveur (« non cité »,
                « secteur non cité »…), tonalité muted/warn — jamais un 0/100. */}
            {!geoCitations.scorable && geoCitations.label && (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                  geoCitations.tone === "warn"
                    ? "border-amber-500/25 bg-amber-500/10 text-amber-500"
                    : "border-border-subtle bg-card-inner-bg text-text-muted"
                }`}
              >
                {geoCitations.label}
              </span>
            )}
            {ctx && !breakdown && !isLocked && (
              // Repli agrégat : SI pas de détail nominatif ET score débloqué.
              // Jamais le chiffre seul, jamais des null (verrouillé → CTA plus
              // bas). Le nombre de pages citées vit AU MÊME niveau (mêmes
              // tabular-nums, même poids) que la médiane et le leader.
              <p className="text-[12px] leading-relaxed text-text-secondary">
                <span className="font-semibold tabular-nums text-text-primary">
                  {ctx.userPages}
                </span>{" "}
                pages citées{" "}
                <span className="text-text-muted">·</span> médiane{" "}
                <span className="font-semibold tabular-nums text-text-primary">
                  {ctx.medianPanelPages}
                </span>{" "}
                <span className="text-text-muted">·</span> leader{" "}
                <span className="font-semibold tabular-nums text-text-primary">
                  {ctx.leaderPages}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── DÉTAIL NOMINATIF par concurrent (si le contrat le fournit) ──
          « Roadsurfer : 2226 pages citées · Vous : 0 » frappe plus fort qu'une
          médiane anonyme. Réutilise le langage visuel de BenchmarkSection. */}
      {ctx && breakdown && (
        <CompetitorBreakdownList breakdown={breakdown} userPages={ctx.userPages} />
      )}

      {/* ── BANDEAU D'ÉCART / DÉBLOCAGE pleine largeur : LE bloc dominant ── */}
      {ctx && (
        <GapBanner
          frame={ctx.frame}
          onExpertClick={onExpertClick ?? noop}
          onUnlock={projectId ? () => setShowUnlock(true) : undefined}
        />
      )}
    </section>
    </>
  );
}
