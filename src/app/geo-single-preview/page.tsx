"use client";

import { bandLabel } from "@/lib/scoreLabel";
import { asset } from "@/lib/asset";

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW (mockée, aucun backend) — nouveau design GEO demandé par le COMEX :
// UN SEUL score global + une interprétation qui le justifie en mots. On SUPPRIME
// les 2 boîtes chiffrées (Technique / Position concurrentielle) : trois chiffres
// perdent un directeur marketing ou un fondateur. Le détail par moteur d'IA reste
// (c'est une preuve, pas un score abstrait). Le plan éditorial reste en dessous.
// 3 niveaux montrés pour voir l'adaptation de l'interprétation.
// ─────────────────────────────────────────────────────────────────────────────

const ARC_PATH =
  "M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301";
const BAND_GRADIENT = {
  critical: { start: "#ef4444", end: "#f97316" },
  medium: { start: "#f97316", end: "#eab308" },
  good: { start: "#22c55e", end: "#4ade80" },
} as const;

const geoIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
  </svg>
);

function GeoSingleCard({
  composite,
  citations,
  interpretation,
  platforms,
}: {
  composite: number;
  citations: { name: string; logo: string; count: number; pages: number }[];
  interpretation: React.ReactNode;
  platforms: boolean;
}) {
  const band: "critical" | "medium" | "good" =
    composite < 50 ? "critical" : composite < 75 ? "medium" : "good";
  const col = BAND_GRADIENT[band];
  const radius = 86.33;
  const circumference = Math.PI * radius;
  const offset = circumference - (composite / 100) * circumference;
  const max = Math.max(1, ...citations.map((c) => c.count));

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]">
      <div className="flex w-full items-center gap-2 px-5 pt-5 md:px-6 md:pt-6">
        <span className="text-text-primary/80">{geoIcon}</span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Visibilité GEO</span>
        <span className="ml-auto text-[11px] font-light text-text-muted">Mesuré le 6 août 2026</span>
      </div>

      {/* Arc UNIQUE (score global) + interprétation à côté. Plus de 2 boîtes chiffrées. */}
      <div className="flex flex-col items-center gap-6 p-5 md:flex-row md:items-center md:gap-8 md:p-6">
        <div className="flex shrink-0 flex-col items-center gap-2.5">
          <div className="relative">
            <svg viewBox="0 0 181 95" className="h-24 w-44">
              <path d={ARC_PATH} fill="none" stroke="var(--arc-bg)" strokeWidth="8" strokeLinecap="round" />
              <path d={ARC_PATH} fill="none" stroke={`url(#g-${composite})`} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
              <defs>
                <linearGradient id={`g-${composite}`} x1="0" y1="0" x2="1" y2="0">
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

        {/* INTERPRÉTATION qui justifie le score (langage business, pas de chiffres bruts). */}
        <div className="w-full flex-1 md:border-l md:border-border-subtle md:pl-8">
          <p className="text-[14px] font-light leading-relaxed text-text-secondary">
            {interpretation}
          </p>
        </div>
      </div>

      {/* Détail par moteur d'IA — preuve concrète, conservé. */}
      {platforms && (
        <div className="flex flex-col gap-3 px-5 pb-2 pt-2 md:px-6">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium uppercase tracking-wide text-text-muted">Par moteur d&apos;IA</span>
            <span className="text-[11px] font-light text-text-muted">Citations · Pages</span>
          </div>
          {citations.map((m) => (
            <div key={m.name} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-card-inner-bg">
                <img src={m.logo} alt={m.name} className="h-full w-full object-contain p-1" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium text-text-primary">{m.name}</span>
                  <span className="shrink-0 text-[12px] text-text-secondary">
                    <span className="font-semibold text-text-primary">{m.count}</span>
                    <span className="text-text-muted"> · {m.pages}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-accent-pink" style={{ width: `${(m.count / max) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="pb-5" />
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

export default function GeoSinglePreviewPage() {
  return (
    <main data-theme="light" className="min-h-screen bg-bg-primary px-4 py-10 md:py-14">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <header className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-accent-pink">Preview interne, données mockées</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-text-primary md:text-3xl">GEO : un seul score + interprétation</h1>
          <p className="mt-2 text-[14px] font-light text-text-muted">Retour COMEX : on retire les 2 sous-scores chiffrés (Technique / Position). Le détail par moteur reste.</p>
        </header>

        <Section label="Score solide (le cas type)">
          <GeoSingleCard
            composite={69}
            platforms
            citations={[
              { name: "ChatGPT", logo: asset("/chatgpt.png"), count: 19, pages: 15 },
              { name: "Perplexity", logo: asset("/perplexity.png"), count: 6, pages: 5 },
              { name: "Copilot", logo: asset("/copilot.svg"), count: 23, pages: 17 },
              { name: "Grok", logo: asset("/grok.svg"), count: 1, pages: 1 },
            ]}
            interpretation={
              <>
                <span className="font-medium text-text-primary">Vous êtes déjà bien présent dans les réponses des IA génératives</span> (ChatGPT, Perplexity, Gemini…). Vos pages sont lisibles par ces moteurs et citées face à vos concurrents. Pour passer un cap, renforcez votre autorité et la fraîcheur de vos contenus stratégiques.
              </>
            }
          />
        </Section>

        <Section label="Score fort (un atout)">
          <GeoSingleCard
            composite={99}
            platforms
            citations={[
              { name: "ChatGPT", logo: asset("/chatgpt.png"), count: 54, pages: 41 },
              { name: "Perplexity", logo: asset("/perplexity.png"), count: 22, pages: 18 },
              { name: "Copilot", logo: asset("/copilot.svg"), count: 31, pages: 24 },
              { name: "Grok", logo: asset("/grok.svg"), count: 8, pages: 6 },
            ]}
            interpretation={
              <>
                <span className="font-medium text-text-primary">Votre visibilité dans les IA génératives est excellente.</span> Vos pages sont largement citées face à vos concurrents, un positionnement que peu de sites atteignent. L&apos;enjeu désormais : tenir cette avance dans la durée.
              </>
            }
          />
        </Section>

        <Section label="Score faible (levier prioritaire)">
          <GeoSingleCard
            composite={25}
            platforms={false}
            citations={[]}
            interpretation={
              <>
                <span className="font-medium text-text-primary">Votre visibilité dans les IA génératives reste limitée.</span> Les moteurs de réponse peinent à lire ou à citer vos pages face à vos concurrents. Structurer vos contenus (FAQ, données structurées) et renforcer votre autorité sont les leviers prioritaires.
              </>
            }
          />
        </Section>
      </div>
    </main>
  );
}
