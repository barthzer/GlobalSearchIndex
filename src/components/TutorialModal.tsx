"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { GEOVisual, SEOSemantiqueVisual, NetlinkingVisual } from "./PillarVisuals";
import type { TabKey } from "@/lib/tabs";

/**
 * Tutoriel d'accueil — coachmark ancré SOUS chaque onglet (réf. product tour / spotlight).
 * Met l'onglet en surbrillance, bascule la vue correspondante, et affiche une grande
 * tooltip (illustration + titre + description) sous l'onglet. Affiché une seule fois.
 */
const DONE_KEY = "gsi:dashboard-tour:v1:done";
const POPOVER_WIDTH = 380;

export function tourSeen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(DONE_KEY) === "1";
  } catch {
    return true;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(DONE_KEY, "1");
  } catch {
    /* mode privé */
  }
}

/** Réinitialise le tutoriel (pour le revoir au prochain chargement du dashboard). */
export function resetTour() {
  try {
    window.localStorage.removeItem(DONE_KEY);
  } catch {
    /* mode privé */
  }
}

const STEPS: {
  tab: TabKey;
  badge: string;
  title: string;
  desc: string;
  visual: React.ReactNode;
}[] = [
  {
    tab: "analyse",
    badge: "Analyse",
    title: "Votre Global Search Index",
    desc: "Vos scores SEO technique, sémantique, autorité et votre visibilité GEO détaillée moteur d'IA par moteur d'IA (ChatGPT, Perplexity, Gemini…).",
    visual: <GEOVisual />,
  },
  {
    tab: "concurrence",
    badge: "Concurrence",
    title: "Analyse concurrentielle",
    desc: "Comparez votre part de voix et votre positionnement face à vos concurrents sur vos mots-clés stratégiques.",
    visual: <SEOSemantiqueVisual />,
  },
  {
    tab: "recommandations",
    badge: "Recommandations",
    title: "Votre plan d'action",
    desc: "Une dizaine de recommandations priorisées et filtrables, chacune avec l'action concrète à mener et le gain estimé.",
    visual: <NetlinkingVisual />,
  },
];

interface Pos {
  top: number;
  left: number;
  caret: number;
  tab: { top: number; left: number; width: number; height: number } | null;
}

function computePos(tab: TabKey): Pos {
  if (typeof document === "undefined") return { top: 100, left: 0, caret: POPOVER_WIDTH / 2, tab: null };
  const el = document.querySelector(`[data-tour-tab="${tab}"]`);
  const vw = window.innerWidth;
  if (!el) {
    return { top: 96, left: Math.max(16, (vw - POPOVER_WIDTH) / 2), caret: POPOVER_WIDTH / 2, tab: null };
  }
  const r = el.getBoundingClientRect();
  const center = r.left + r.width / 2;
  const left = Math.max(16, Math.min(center - POPOVER_WIDTH / 2, vw - POPOVER_WIDTH - 16));
  return {
    top: r.bottom + 14,
    left,
    caret: center - left,
    tab: { top: r.top, left: r.left, width: r.width, height: r.height },
  };
}

export default function TutorialModal({
  onClose,
  onFocusTab,
}: {
  onClose: () => void;
  onFocusTab: (tab: TabKey) => void;
}) {
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState<Pos | null>(null);
  const [mounted, setMounted] = useState(false);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  useEffect(() => setMounted(true), []);

  // À chaque étape : bascule la vue sur l'onglet, puis mesure sa position (avec
  // plusieurs essais le temps que le layout de la nouvelle vue se stabilise).
  useEffect(() => {
    const tab = STEPS[step].tab;
    onFocusTab(tab);
    let cancelled = false;
    const doMeasure = () => {
      if (!cancelled) setPos(computePos(tab));
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(doMeasure));
    const timers = [setTimeout(doMeasure, 80), setTimeout(doMeasure, 220), setTimeout(doMeasure, 450)];
    window.addEventListener("resize", doMeasure);
    window.addEventListener("scroll", doMeasure, true);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", doMeasure);
      window.removeEventListener("scroll", doMeasure, true);
    };
  }, [step, onFocusTab]);

  function finish() {
    markSeen();
    onFocusTab("analyse");
    onClose();
  }

  // Rien à afficher tant que la première mesure n'a pas eu lieu (effet ci-dessus).
  if (!mounted || !pos) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-bg-primary/70 backdrop-blur-[2px]"
        onClick={finish}
        style={{ animation: "fade-up 250ms var(--ease-out) both" }}
      />

      {/* Onglet actif rendu net au-dessus de l'overlay flouté (pas de contour, pas de flou). */}
      {pos.tab && (
        <div
          className="pointer-events-none absolute flex items-center justify-center rounded-full bg-bg-card text-[16px] font-medium text-text-primary shadow-sm"
          style={{
            top: pos.tab.top,
            left: pos.tab.left,
            width: pos.tab.width,
            height: pos.tab.height,
            transition: "top 420ms var(--ease-in-out), left 420ms var(--ease-in-out), width 420ms var(--ease-in-out)",
          }}
        >
          {current.badge}
        </div>
      )}

      {/* Popover sous l'onglet */}
      <div
        className="absolute"
        style={{
          top: pos.top,
          left: pos.left,
          width: POPOVER_WIDTH,
          transition: "top 420ms var(--ease-in-out), left 420ms var(--ease-in-out)",
        }}
      >
        {/* Caret */}
        <div
          className="absolute -top-1.5 h-3 w-3 rotate-45 border-l border-t border-white/10 bg-modal-bg"
          style={{
            left: Math.max(14, Math.min(pos.caret - 6, POPOVER_WIDTH - 26)),
            transition: "left 420ms var(--ease-in-out)",
          }}
        />

        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-modal-bg shadow-[0_8px_24px_-14px_rgba(0,0,0,0.4)]"
          style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
        >
          {/* Illustration — bloc (fond coloré + visuel) à 4px de marge, coins arrondis 12px */}
          <div
            className="relative m-1 h-52 overflow-hidden rounded-xl"
            style={{ background: "linear-gradient(160deg, rgba(95,20,251,0.22) 0%, rgba(236,77,203,0.22) 100%)" }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)",
                backgroundSize: "13px 13px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4 [&>*]:h-full [&>*]:w-full">
              {current.visual}
            </div>
          </div>

          {/* Contenu */}
          <div className="flex flex-col gap-3 p-5">
            <div>
              <h2 className="mb-1.5 text-[17px] font-medium leading-tight tracking-[-0.3px] text-text-primary">
                {current.title}
              </h2>
              <p className="text-[13px] font-light leading-relaxed text-text-secondary">{current.desc}</p>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === step ? 18 : 7,
                      background:
                        i === step
                          ? "var(--accent-pink)"
                          : i < step
                            ? "rgba(236,77,203,0.45)"
                            : "var(--step-future)",
                      transitionTimingFunction: "var(--ease-out)",
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={step === 0 ? finish : () => setStep((s) => s - 1)}
                  className="rounded-full px-3 py-2 text-[13px] font-medium text-text-muted transition-colors duration-200 hover:text-text-primary"
                >
                  {step === 0 ? "Passer" : "Retour"}
                </button>
                <Button variant="primary" onClick={isLast ? finish : () => setStep((s) => s + 1)}>
                  {isLast ? "Commencer" : "Suivant"}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {isLast ? (
                      <path d="M4.5 12.75l6 6 9-13.5" />
                    ) : (
                      <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    )}
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
