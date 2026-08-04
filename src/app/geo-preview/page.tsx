"use client";

import type { ScoreDisplay } from "@/lib/scores";
import PilierIA, { type GeoCitationsDisplay } from "@/components/PilierIA";

// ─────────────────────────────────────────────────────────────────────────────
// PRÉVISUALISATION du Pilier IA (2 arcs + bandeau d'écart). PAS de backend live :
// on rend PilierIA avec des ScoreDisplay MOCK représentant les 4 états clés.
// But : que Kevin VOIE le rendu (surtout que l'écart DOMINE) avant qu'on le fige.
// ─────────────────────────────────────────────────────────────────────────────

// Helper : display /100 scorable (Lisibilité). La bande est décidée « serveur »
// ici en dur pour le mock (rouge < 50, ambre 50-74, vert >= 75).
function readability(value: number): ScoreDisplay {
  const band = value < 50 ? "critical" : value < 75 ? "medium" : "good";
  return {
    type: "geo",
    scorable: true,
    value,
    absolute: false,
    neutralArc: false,
    tone: band === "good" ? "ok" : band === "medium" ? "warn" : "warn",
    band,
    label: null,
    message: null,
    caption: "Lisibilité IA",
  };
}

// (a) completed AVEC écart : Lisibilité 75 (bon) + Citations 7 (faible). L'écart
// 75 vs 7 doit sauter aux yeux. frame:null → bandeau neutre (technique).
const A_READ = readability(75);
const A_CITE: GeoCitationsDisplay = {
  type: "geo",
  scorable: true,
  value: 7,
  absolute: false,
  neutralArc: false,
  tone: "warn",
  band: "critical",
  label: "citations rares",
  message: "Votre contenu est rarement repris par les IA.",
  caption: "Citations IA",
  geoContext: {
    userPages: 57,
    medianPanelPages: 552,
    leaderPages: 2226,
    frame: null,
    // Détail nominatif : « Vous : 57 » se place entre we-van (166) et le bas.
    competitorBreakdown: [
      { domain: "roadsurfer.com", citedPages: 2226 },
      { domain: "wikicampers.fr", citedPages: 552 },
      { domain: "we-van.com", citedPages: 166 },
    ],
  },
};

// (b) concurrents_cites_pas_vous (URGENCE) — LE cas central. Citations NON
// scorable (0 page citée) → pas de 0/100, état qualitatif « non cité ».
const B_READ = readability(75);
const B_CITE: GeoCitationsDisplay = {
  type: "geo",
  scorable: false,
  value: null,
  absolute: false,
  neutralArc: false,
  tone: "warn",
  band: null,
  label: "non cité",
  message: "Aucune de vos pages n'est citée par les IA sur ce panel.",
  caption: "Citations IA",
  geoContext: {
    userPages: 0,
    medianPanelPages: 552,
    leaderPages: 2226,
    frame: "urgence",
    panelState: "prospect_non_cite",
    // Cas qui frappe : « Vous : 0 » en bas, surligné, face à Roadsurfer 2226.
    competitorBreakdown: [
      { domain: "roadsurfer.com", citedPages: 2226 },
      { domain: "wikicampers.fr", citedPages: 552 },
      { domain: "we-van.com", citedPages: 166 },
    ],
  },
};

// (c) secteur_non_cite (OPPORTUNITÉ) : personne n'est cité, place à prendre.
const C_READ = readability(60);
const C_CITE: GeoCitationsDisplay = {
  type: "geo",
  scorable: false,
  value: null,
  absolute: false,
  neutralArc: false,
  tone: "muted",
  band: null,
  label: "secteur non cité",
  message: "Aucun acteur de votre secteur n'est encore cité par les IA.",
  caption: "Citations IA",
  geoContext: {
    userPages: 0,
    medianPanelPages: 0,
    leaderPages: 0,
    frame: "opportunite",
    panelState: "secteur_non_cite",
  },
};

// (d) unavailable (TECHNIQUE) : mesure indisponible, aucun argumentaire.
const D_READ = readability(82);
const D_CITE: GeoCitationsDisplay = {
  type: "geo",
  scorable: false,
  value: null,
  absolute: false,
  neutralArc: false,
  tone: "muted",
  band: null,
  label: "mesure indisponible",
  message: "La citabilité IA n'a pas pu être mesurée sur ce panel.",
  caption: "Citations IA",
  geoContext: {
    userPages: 0,
    medianPanelPages: 0,
    leaderPages: 0,
    frame: "technique",
    panelState: "unavailable",
  },
};

const CASES: {
  key: string;
  title: string;
  read: ScoreDisplay;
  cite: GeoCitationsDisplay;
}[] = [
  { key: "a", title: "(a) completed avec écart — 75 vs 7", read: A_READ, cite: A_CITE },
  {
    key: "b",
    title: "(b) concurrents cités, pas vous — URGENCE (cas central)",
    read: B_READ,
    cite: B_CITE,
  },
  { key: "c", title: "(c) secteur non cité — OPPORTUNITÉ", read: C_READ, cite: C_CITE },
  { key: "d", title: "(d) mesure indisponible — TECHNIQUE", read: D_READ, cite: D_CITE },
];

export default function GeoPreviewPage() {
  return (
    <main data-theme="light" className="min-h-screen bg-bg-primary px-4 py-10 md:py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-14">
        <header className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-accent-pink">
            Preview interne
          </p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-text-primary md:text-3xl">
            Pilier IA — deux arcs + bandeau d&apos;écart
          </h1>
          <p className="mt-2 text-[14px] font-light text-text-muted">
            4 états mockés. Aucun backend live.
          </p>
        </header>

        {CASES.map(({ key, title, read, cite }) => (
          <section key={key} className="flex flex-col gap-4">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">
              {title}
            </h2>
            <PilierIA
              geoCitability={read}
              geoCitations={cite}
              onExpertClick={() => {}}
            />
          </section>
        ))}
      </div>
    </main>
  );
}
