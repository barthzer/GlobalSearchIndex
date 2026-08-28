"use client";

/**
 * Fil d'étapes animées de l'écran d'analyse (côté droit du split screen).
 * Façon assistant-ui : chaque étape est une carte qui s'ouvre avec une
 * mini-scène illustrant ce qui se passe, en langage non technique
 * (cible : dirigeant / directeur marketing).
 */

/* ── Mini-scènes ─────────────────────────────────────────── */

/** Lecture du site : mini-fenêtre avec lignes de texte + balayage de scan. */
function SceneCrawl() {
  return (
    <div className="relative mx-auto h-[76px] w-[128px] overflow-hidden rounded-xl border border-border-subtle bg-white">
      <div className="flex items-center gap-1 border-b border-border-subtle px-2.5 py-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-black/10" />
        ))}
      </div>
      <div className="flex flex-col gap-1.5 px-2.5 py-2">
        <span className="h-1.5 w-4/5 rounded-full bg-black/[0.08]" />
        <span className="h-1.5 w-full rounded-full bg-black/[0.08]" />
        <span className="h-1.5 w-3/5 rounded-full bg-black/[0.08]" />
      </div>
      {/* Balayage : dégradé rosé étalé */}
      <div
        className="animate-av-scan absolute left-0 right-0 top-4 h-10"
        style={{ background: "linear-gradient(180deg, rgba(236,77,203,0.15) 0%, rgba(236,77,203,0) 100%)" }}
      />
    </div>
  );
}

/** Mots-clés : tags qui s'allument tour à tour. */
function SceneKeywords() {
  const tags = ["vos services", "votre ville", "vos produits"];
  return (
    <div className="mx-auto flex h-[76px] w-[150px] flex-col items-center justify-center gap-1.5">
      {tags.map((t, i) => (
        <span
          key={t}
          className="animate-av-pop inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-white px-2.5 py-1 text-[10px] font-medium text-text-secondary"
          style={{ animationDelay: `${i * 1.1}s` }}
        >
          <svg className="h-2.5 w-2.5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          {t}
        </span>
      ))}
    </div>
  );
}

/** Moteurs d'IA : question posée, les LLM interrogés, l'IA rédige. */
function SceneAI() {
  return (
    <div className="mx-auto flex h-[76px] w-[150px] flex-col justify-center gap-2">
      <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm border border-border-subtle bg-white px-3 py-1.5 text-[10px] text-text-secondary">
        Qui recommander&nbsp;?
      </div>
      <div className="flex items-center justify-between">
        {/* Les moteurs interrogés, légèrement superposés */}
        <div className="flex items-center -space-x-1.5">
          {["/chatgpt.png", "/gemini.png", "/perplexity.png"].map((src) => (
            <span key={src} className="relative flex h-5 w-5 items-center justify-center rounded-full border border-border-subtle bg-white">
              <img src={src} alt="" className="h-3 w-3 object-contain" />
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl rounded-br-sm bg-gradient-to-r from-[#EC4DCB] to-[#FF8FDE] px-3 py-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="animate-av-dot h-1.5 w-1.5 rounded-full bg-white" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Concurrents : barres comparatives qui poussent, la vôtre en couleur. */
function SceneCompetitors() {
  const bars = [
    { h: 34, you: false },
    { h: 52, you: true },
    { h: 42, you: false },
    { h: 24, you: false },
  ];
  return (
    <div className="mx-auto flex h-[76px] w-[128px] items-end justify-center gap-2.5 pb-1">
      {bars.map((b, i) => (
        <div key={i} className="relative flex flex-col items-center gap-1">
          {/* Repère « Vous » : suit le sommet de la barre du client */}
          {b.you && (
            <span
              className="animate-av-bar-label absolute -top-4 left-1/2 whitespace-nowrap rounded-md bg-[#1a1025] px-1.5 py-0.5 text-[8px] font-medium leading-none text-white"
              style={{ animationDelay: `${i * 0.18}s` }}
            >
              Vous
              <span className="absolute left-1/2 top-full h-1 w-1 -translate-x-1/2 -translate-y-0.5 rotate-45 bg-[#1a1025]" />
            </span>
          )}
          <span
            className={`animate-av-bar w-5 rounded-t-md ${b.you ? "bg-gradient-to-t from-[#EC4DCB] to-[#FF9BE4]" : "bg-black/[0.10]"}`}
            style={{ height: b.h, animationDelay: `${i * 0.18}s` }}
          />
          <span className={`h-1 w-4 rounded-full ${b.you ? "bg-accent-pink/60" : "bg-black/[0.08]"}`} />
        </div>
      ))}
    </div>
  );
}

/* ── Étapes ──────────────────────────────────────────────── */

export const ANALYSIS_STEPS = [
  {
    title: "Lecture de votre site",
    subtitle: "Nous parcourons vos pages comme le font Google et les IA.",
    Scene: SceneCrawl,
  },
  {
    title: "Analyse de vos mots-clés",
    subtitle: "Ce que vos clients recherchent, et où vous apparaissez.",
    Scene: SceneKeywords,
  },
  {
    title: "Interrogation des moteurs d'IA",
    subtitle: "ChatGPT, Perplexity, Gemini... parlent-ils de vous ?",
    Scene: SceneAI,
  },
  {
    title: "Comparaison avec vos concurrents",
    subtitle: "Votre position face aux autres acteurs de votre marché.",
    Scene: SceneCompetitors,
  },
];

/* ── Fil de cartes ───────────────────────────────────────── */

export default function AnalysisStepsFeed({ verified, activeStep }: { verified: boolean; activeStep: number }) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      {ANALYSIS_STEPS.map((step, i) => {
        const isActive = verified && i === activeStep;
        const isDone = verified && i < activeStep;
        const Scene = step.Scene;
        return (
          <div
            key={step.title}
            className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
              isActive
                ? "border-border-subtle bg-white shadow-[0_12px_32px_-16px_rgba(14,4,27,0.25)]"
                : "border-transparent"
            }`}
            style={{
              opacity: !verified ? 0.3 : isActive ? 1 : isDone ? 0.55 : 0.25,
              transitionTimingFunction: "var(--ease-out)",
            }}
          >
            {/* En-tête de l'étape */}
            <div className={`flex items-center gap-3 ${isActive ? "px-4 pt-3.5" : "px-4 py-1.5"}`}>
              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                {isDone ? (
                  <svg className="h-4 w-4 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : isActive ? (
                  <span className="h-2 w-2 rounded-full bg-accent-purple animate-pulse" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
                )}
              </div>
              <span className={`text-sm ${isActive ? "font-medium text-text-primary" : "text-text-secondary"}`}>
                {step.title}
              </span>
            </div>

            {/* Scène animée + explication, uniquement sur l'étape en cours */}
            <div
              className="grid transition-[grid-template-rows] duration-300"
              style={{ gridTemplateRows: isActive ? "1fr" : "0fr", transitionTimingFunction: "var(--ease-out)" }}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-3">
                  <div className="rounded-xl bg-black/[0.03] py-3">
                    <Scene />
                  </div>
                  <p className="mt-2.5 text-[12px] font-light leading-relaxed text-text-muted">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
