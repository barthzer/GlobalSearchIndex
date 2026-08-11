"use client";

import ExpertCtaBanner from "@/components/ExpertCtaBanner";
import { asset } from "@/lib/asset";
import RealScoreArc from "@/components/RealScoreArc";
import { scoreInfos, scoreIcons } from "@/app/dashboard/rapport/score-infos";
import { bandLabel } from "@/lib/scoreLabel";
import type { ScoreDisplay } from "@/lib/scores";

// ─────────────────────────────────────────────────────────────────────────────
// MAQUETTE (données mockées, aucun backend) — nouveau design GEO « modèle autorité ».
// 3 états à juger côte à côte, langage 100 % Barth (accent-pink, ExpertCtaBanner,
// cartes/tokens existants ; aucun libellé de frame visible à l'écran) :
//   1. VERROUILLÉ (avant déblocage) — pattern autorité, tout derrière le verrou.
//   2. COMPLETED — composite en tête + 2 sous-composantes À CÔTÉ + date de mesure.
//   3. Concurrents cités, pas vous — le constat en tête, technique en sous-ligne.
// Chiffres = payload réel du contrat (van-it août : technique 92, geo_score 23 → 51).
// ─────────────────────────────────────────────────────────────────────────────

const geoIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
  </svg>
);
const ARC_PATH =
  "M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301";
const BAND_GRADIENT = {
  critical: { start: "#ef4444", end: "#f97316" },
  medium: { start: "#f97316", end: "#eab308" },
  good: { start: "#22c55e", end: "#4ade80" },
} as const;

// ── 2. COMPLETED — composite en tête, 2 sous-composantes À CÔTÉ, date de mesure ──
function GeoCompositeCard() {
  const composite = 51; // round(0.4·92 + 0.6·23) — payload réel van-it, août 2026
  const technique = 92;
  const position = 23; // sub_citations = geo_score relatif (0-99)
  const citedCount = 174; // details.user_citations (compte brut)
  const band: "critical" | "medium" | "good" = composite < 50 ? "critical" : composite < 75 ? "medium" : "good";
  const col = BAND_GRADIENT[band];
  const radius = 86.33;
  const circumference = Math.PI * radius;
  const offset = circumference - (composite / 100) * circumference;
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]">
      <div className="flex w-full items-center gap-2 px-5 pt-5 md:px-6 md:pt-6">
        <span className="text-text-primary/80">{geoIcon}</span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Visibilité GEO</span>
        {/* Date de mesure — le score est un instantané Ahrefs */}
        <span className="ml-auto text-[11px] font-light text-text-muted">Mesuré le 5 août 2026</span>
      </div>

      <div className="flex flex-col items-center gap-6 p-5 md:flex-row md:items-center md:gap-8 md:p-6">
        {/* Composite en tête */}
        <div className="flex shrink-0 flex-col items-center gap-2.5">
          <div className="relative">
            <svg viewBox="0 0 181 95" className="h-24 w-44">
              <path d={ARC_PATH} fill="none" stroke="var(--arc-bg)" strokeWidth="8" strokeLinecap="round" />
              <path d={ARC_PATH} fill="none" stroke="url(#comp-grad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
              <defs>
                <linearGradient id="comp-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={col.start} />
                  <stop offset="100%" stopColor={col.end} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-end justify-center">
              <span className="text-3xl font-bold tabular-nums text-text-primary">{composite}</span>
              <span className="mb-1 text-sm text-text-muted">/100</span>
            </div>
          </div>
          <span className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${bandLabel(band).chip}`}>
            {bandLabel(band).label}
          </span>
          <span className="text-[12px] font-medium text-text-secondary">Score GEO</span>
        </div>

        {/* Les 2 sous-composantes À CÔTÉ (pas dessous) */}
        <div className="grid w-full flex-1 grid-cols-2 gap-3 md:border-l md:border-border-subtle md:pl-8">
          <div className="rounded-xl border border-border-subtle bg-card-inner-bg px-4 py-3">
            <div className="text-[22px] font-bold tabular-nums text-text-primary">{technique}</div>
            <div className="mt-0.5 text-[12px] font-medium text-text-secondary">Technique</div>
            <div className="text-[11px] font-light leading-tight text-text-muted">structure, accès, formats</div>
          </div>
          <div className="rounded-xl border border-border-subtle bg-card-inner-bg px-4 py-3">
            <div className="text-[22px] font-bold tabular-nums text-text-primary">{position}</div>
            <div className="mt-0.5 text-[12px] font-medium text-text-secondary">Position concurrentielle</div>
            <div className="text-[11px] font-light leading-tight text-text-muted">vous êtes cité {citedCount} fois</div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 md:px-6 md:pb-6">
        <p className="rounded-xl border border-border-subtle bg-card-inner-bg px-4 py-2.5 text-[12px] font-light leading-relaxed text-text-secondary">
          <span className="font-medium text-text-primary">Position concurrentielle {position}, vous êtes cité {citedCount} fois.</span>{" "}
          Bon volume de citations, mais loin des leaders du panel : le levier est l&apos;autorité relative, pas la structure (déjà à {technique}).
        </p>
      </div>
    </div>
  );
}

// Displays mockés pour les cartes voisines + le verrou (vrais composants).
function arc(value: number): ScoreDisplay {
  const band = value < 50 ? "critical" : value < 75 ? "medium" : "good";
  return { type: "seo", scorable: true, value, absolute: false, neutralArc: false, tone: "ok", band, label: null, message: null, caption: "Score sur 100" };
}
const LOCKED: ScoreDisplay = { type: "geo", scorable: false, value: null, absolute: false, neutralArc: false, tone: "muted", band: null, label: null, message: "Score disponible après l'analyse concurrentielle.", caption: "Verrouillé" };

// ── 3. Concurrents cités, pas vous — constat en tête, technique en sous-ligne ──
const ROWS = [
  { name: "ChatGPT", logo: asset("/chatgpt.png"), competitor: "Roadsurfer", cited: 12 },
  { name: "Perplexity", logo: asset("/perplexity.png"), competitor: "We-van", cited: 8 },
  { name: "Copilot", logo: asset("/copilot.svg"), competitor: "Roadsurfer", cited: 5 },
  { name: "Gemini", logo: asset("/gemini.png"), competitor: "Wikicampers", cited: 3 },
];
const MAX = Math.max(...ROWS.map((r) => r.cited));
function GeoStatementCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]">
      <div className="flex w-full items-center gap-2 px-5 pt-5 md:px-6 md:pt-6">
        <span className="text-text-primary/80">{geoIcon}</span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Visibilité GEO</span>
        <span className="ml-auto text-[11px] font-light text-text-muted">Mesuré le 5 août 2026</span>
      </div>
      <div className="px-5 pt-4 md:px-6">
        <div className="flex items-start gap-3 rounded-2xl border border-accent-pink/20 bg-accent-pink/[0.06] px-5 py-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-pink/10 text-accent-pink">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </span>
          <div>
            <h3 className="text-[17px] font-semibold leading-snug text-text-heading">Vos concurrents sont cités par les IA. Pas vous.</h3>
            <p className="mt-1.5 text-[13px] font-light leading-relaxed text-text-secondary">
              Site techniquement prêt (<span className="font-medium text-text-primary">Technique 100</span> · structure, accès, formats).
              Le levier n&apos;est pas la structure : c&apos;est l&apos;autorité et les citations.
            </p>
          </div>
        </div>
      </div>
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

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">{label}</h2>
      {children}
    </section>
  );
}

export default function GeoCompositePreviewPage() {
  return (
    <main data-theme="light" className="min-h-screen bg-bg-primary px-4 py-10 md:py-14">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <header className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-accent-pink">Maquette interne, données mockées</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-text-primary md:text-3xl">GEO composite : les 3 états</h1>
          <p className="mt-2 text-[14px] font-light text-text-muted">Modèle autorité. Chiffres du payload réel (van-it août : composite 51).</p>
        </header>

        <Section label="1. Avant déblocage : VERROUILLÉ (pattern autorité, tout derrière le verrou)">
          <RealScoreArc label="Visibilité GEO" icon={geoIcon} display={LOCKED} info={scoreInfos.autorite} delay={0} unlockable projectId="preview" unlockCtaLabel="Débloquer mon score GEO" />
        </Section>

        <Section label="2. Après déblocage : COMPLETED (composite + 2 sous-composantes à côté)">
          <GeoCompositeCard />
        </Section>

        <Section label="3. Après déblocage : concurrents cités, pas vous (constat en tête)">
          <GeoStatementCard />
        </Section>

        {/* Contexte : la carte au milieu des autres piliers */}
        <Section label="Contexte : la carte COMPLETED au milieu des autres piliers de l'onglet Analyse">
          <div className="flex flex-col gap-4">
            <GeoCompositeCard />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <RealScoreArc label="SEO Technique" icon={scoreIcons.technique} display={arc(76)} info={scoreInfos.technique} delay={0} />
              <RealScoreArc label="SEO Sémantique" icon={scoreIcons.semantique} display={arc(64)} info={scoreInfos.semantique} delay={120} />
              <RealScoreArc label="Autorité" icon={scoreIcons.autorite} display={arc(56)} info={scoreInfos.autorite} delay={240} />
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
