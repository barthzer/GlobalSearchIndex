"use client";

import ExpertCtaBanner from "@/components/ExpertCtaBanner";
import RealScoreArc from "@/components/RealScoreArc";
import { scoreInfos, scoreIcons } from "@/app/dashboard/rapport/score-infos";
import type { ScoreDisplay } from "@/lib/scores";

// ─────────────────────────────────────────────────────────────────────────────
// MAQUETTE (données mockées, aucun backend) — nouveau design GEO « modèle autorité »,
// V2 intégrée dans le layout de l'onglet Analyse (la carte GEO AU MILIEU des autres).
// Cas où les concurrents sont cités par les IA et pas le prospect (le plus fréquent).
// Langage 100 % Barth : accent-pink (pas de rouge étranger), ExpertCtaBanner,
// cartes/tokens existants. Aucun libellé de frame (urgence/…) visible à l'écran.
// ─────────────────────────────────────────────────────────────────────────────

const geoIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
  </svg>
);

const ROWS = [
  { name: "ChatGPT", logo: "/barth-staging/chatgpt.png", competitor: "Roadsurfer", cited: 12 },
  { name: "Perplexity", logo: "/barth-staging/perplexity.png", competitor: "We-van", cited: 8 },
  { name: "Copilot", logo: "/barth-staging/copilot.svg", competitor: "Roadsurfer", cited: 5 },
  { name: "Gemini", logo: "/barth-staging/gemini.png", competitor: "Wikicampers", cited: 3 },
];
const MAX = Math.max(...ROWS.map((r) => r.cited));

// Carte GEO — état « concurrents cités, pas vous ». Le constat EN TÊTE (langage
// accent-pink de Barth, comme la carte 'opportunité'), la technique en sous-ligne.
function GeoStatementCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]">
      <div className="flex w-full items-center gap-2 px-5 pt-5 md:px-6 md:pt-6">
        <span className="text-text-primary/80">{geoIcon}</span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Visibilité GEO</span>
      </div>

      {/* Constat en tête — tokens accent-pink de Barth (bordure/fond doux, icône pink) */}
      <div className="px-5 pt-4 md:px-6">
        <div className="flex items-start gap-3 rounded-2xl border border-accent-pink/20 bg-accent-pink/[0.06] px-5 py-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-pink/10 text-accent-pink">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </span>
          <div>
            <h3 className="text-[17px] font-semibold leading-snug text-text-heading">
              Vos concurrents sont cités par les IA — pas vous.
            </h3>
            <p className="mt-1.5 text-[13px] font-light leading-relaxed text-text-secondary">
              Site techniquement prêt (<span className="font-medium text-text-primary">Technique 100</span> · structure,
              accès, formats). Le levier n&apos;est pas la structure : c&apos;est l&apos;autorité et les citations.
            </p>
          </div>
        </div>
      </div>

      {/* Par-moteur nominatif — « Concurrent N · Vous 0 » (contraste sobre, sans rouge) */}
      <div className="px-5 pt-5 md:px-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[12px] font-medium uppercase tracking-wide text-text-muted">Par moteur d&apos;IA</span>
          <span className="text-[11px] font-light text-text-muted">Concurrent cité · Vous</span>
        </div>
        <div className="flex flex-col gap-3">
          {ROWS.map((r) => (
            <div key={r.name} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-card-inner-bg">
                <img src={r.logo} alt={r.name} className="h-full w-full object-contain p-1" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium text-text-primary">{r.name}</span>
                  <span className="shrink-0 text-[12px]">
                    <span className="text-text-secondary">{r.competitor} </span>
                    <span className="font-semibold text-text-primary">{r.cited}</span>
                    <span className="text-text-muted"> · Vous </span>
                    <span className="font-semibold text-text-secondary">0</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-accent-pink" style={{ width: `${(r.cited / MAX) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 md:p-6">
        <ExpertCtaBanner
          onExpertClick={() => {}}
          title="Vos concurrents récoltent les citations. Pas vous."
          body="Votre site est fait pour être repris par les IA, mais ce sont vos concurrents qui décrochent les citations. Un expert AWI identifie pourquoi et comment renverser l'écart."
          cta="Parler à un expert"
        />
      </div>
    </div>
  );
}

// Displays mockés pour les cartes voisines (langage réel RealScoreArc).
function arc(value: number): ScoreDisplay {
  const band = value < 50 ? "critical" : value < 75 ? "medium" : "good";
  return { type: "seo", scorable: true, value, absolute: false, neutralArc: false, tone: "ok", band, label: null, message: null, caption: "Score sur 100" };
}
const LOCKED: ScoreDisplay = { type: "semantic", scorable: false, value: null, absolute: false, neutralArc: false, tone: "muted", band: null, label: null, message: "Débloquez l'analyse concurrentielle.", caption: "En attente" };

export default function GeoCompositePreviewPage() {
  return (
    <main data-theme="light" className="min-h-screen bg-bg-primary px-4 py-10 md:py-14">
      <div className="mx-auto flex max-w-5xl flex-col">
        <header className="mb-8 text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-accent-pink">Maquette interne — données mockées</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-text-primary md:text-3xl">Onglet Analyse — carte GEO (constat) au milieu des autres</h1>
        </header>

        {/* Encart GEO (pleine largeur, comme dans l'onglet Analyse) */}
        <div className="mb-4">
          <GeoStatementCard />
        </div>

        {/* Grille des 3 autres piliers — vrais composants RealScoreArc, displays mockés */}
        <section className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RealScoreArc label="SEO Technique" icon={scoreIcons.technique} display={arc(76)} info={scoreInfos.technique} delay={0} />
          <RealScoreArc label="SEO Sémantique" icon={scoreIcons.semantique} display={LOCKED} info={scoreInfos.semantique} delay={120} unlockable projectId="preview" />
          <RealScoreArc label="Autorité" icon={scoreIcons.autorite} display={arc(56)} info={scoreInfos.autorite} delay={240} />
        </section>
      </div>
    </main>
  );
}
