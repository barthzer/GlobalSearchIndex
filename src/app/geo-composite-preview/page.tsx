"use client";

import ExpertCtaBanner from "@/components/ExpertCtaBanner";

// ─────────────────────────────────────────────────────────────────────────────
// MAQUETTE (données mockées, aucun backend) — nouveau design GEO « modèle autorité ».
// Cas concurrents_cites_pas_vous (≈2/3 des panels COMEX, cas d'origine) :
// le CADRAGE URGENCE est la carte (en tête), la technique descend en sous-ligne,
// ExpertCtaBanner en pied. Le chiffre technique ne s'affiche JAMAIS seul ni en tête.
// À valider à l'écran avant le câblage réel (qui attend le contrat SEO Engine).
// ─────────────────────────────────────────────────────────────────────────────

const geoIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
  </svg>
);

// Données mockées : le prospect (Vous 0) face à ses concurrents cités par moteur.
const ROWS = [
  { name: "ChatGPT", logo: "/barth-staging/chatgpt.png", competitor: "Roadsurfer", cited: 12 },
  { name: "Perplexity", logo: "/barth-staging/perplexity.png", competitor: "We-van", cited: 8 },
  { name: "Copilot", logo: "/barth-staging/copilot.svg", competitor: "Roadsurfer", cited: 5 },
  { name: "Gemini", logo: "/barth-staging/gemini.png", competitor: "Wikicampers", cited: 3 },
];
const MAX = Math.max(...ROWS.map((r) => r.cited));

function UrgencyCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]">
      {/* Header */}
      <div className="flex w-full items-center gap-2 px-5 pt-5 md:px-6 md:pt-6">
        <span className="text-text-primary/80">{geoIcon}</span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Visibilité GEO</span>
      </div>

      {/* CADRAGE URGENCE = en tête (pas un chiffre) */}
      <div className="px-5 pt-4 md:px-6">
        <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/[0.07] px-4 py-3.5">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-[17px] font-semibold leading-snug text-text-primary">
              Vos concurrents sont cités par les IA — pas vous.
            </p>
            {/* Technique en SOUS-LIGNE, reframée : le 100 n'est pas le problème */}
            <p className="mt-1.5 text-[13px] font-light leading-relaxed text-text-secondary">
              Site techniquement prêt (<span className="font-medium text-text-primary">Technique 100</span> · structure,
              accès, formats). Le problème n&apos;est pas la structure : c&apos;est l&apos;autorité et les citations.
            </p>
          </div>
        </div>
      </div>

      {/* Par-moteur nominatif : le contraste « Concurrent N · Vous 0 » */}
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
                    <span className="font-semibold text-red-400">0</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-accent-pink/70" style={{ width: `${(r.cited / MAX) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ExpertCtaBanner : le CTA qui convertit le diagnostic en RDV */}
      <div className="p-5 md:p-6">
        <ExpertCtaBanner
          onExpertClick={() => {}}
          title="Vos concurrents captent la visibilité IA"
          body="Votre site est prêt techniquement : le levier, c'est l'autorité. Un expert AWI vous montre comment être cité à votre tour."
          cta="Parler à un expert"
        />
      </div>
    </div>
  );
}

export default function GeoCompositePreviewPage() {
  return (
    <main data-theme="light" className="min-h-screen bg-bg-primary px-4 py-10 md:py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-accent-pink">
            Maquette interne — données mockées
          </p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-text-primary md:text-3xl">
            GEO — cas « concurrents cités, pas vous » (URGENCE)
          </h1>
          <p className="mt-2 text-[14px] font-light text-text-muted">
            Nouveau modèle « autorité » : le cadrage urgence en tête, la technique en sous-ligne,
            jamais le chiffre technique seul. À valider avant câblage.
          </p>
        </header>
        <UrgencyCard />
      </div>
    </main>
  );
}
