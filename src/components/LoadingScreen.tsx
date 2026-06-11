"use client";

import { useEffect, useState } from "react";

const steps = [
  "Analyse des balises et du maillage technique...",
  "Clustering sémantique par intention de recherche...",
  "Scan de visibilité sur les LLM...",
  "Évaluation du profil de backlinks...",
];

interface LoadingScreenProps {
  url: string;
  onComplete: () => void;
}

export default function LoadingScreen({ url, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const duration = 2800;
    const interval = 20;
    const increment = 100 / (duration / interval);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setTimeout(onComplete, 200);
      }
      setProgress(current);
      setActiveStep(Math.min(Math.floor(current / 25), 3));
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-bg-overlay mix-blend-hue" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(95,20,251,0.3) 0%, transparent 60%)",
        }}
      />

      <div
        className="relative flex w-full max-w-md flex-col items-center px-6"
        style={{ animation: "fade-up 500ms var(--ease-expo) both" }}
      >
        {/* Spinning ring */}
        <div className="relative mb-10 h-20 w-20">
          <svg viewBox="0 0 80 80" className="h-20 w-20 animate-spin" style={{ animationDuration: "2.5s" }}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="url(#loader-grad)" strokeWidth="3"
              strokeLinecap="round" strokeDasharray="214" strokeDashoffset="160"
            />
            <defs>
              <linearGradient id="loader-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5f14fb" />
                <stop offset="100%" stopColor="#ec4dcb" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold tabular-nums text-text-primary">
              {Math.round(progress)}
            </span>
          </div>
        </div>

        {/* URL */}
        <p className="mb-6 max-w-full truncate rounded-full border border-border-subtle bg-bg-card px-5 py-2.5 text-center text-sm text-text-secondary">
          {url}
        </p>

        {/* Steps */}
        <div className="flex w-full flex-col gap-3">
          {steps.map((step, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;

            return (
              <div
                key={i}
                className="flex items-center gap-3 transition-all duration-300"
                style={{
                  opacity: isDone ? 0.4 : isActive ? 1 : 0.2,
                  transform: isActive ? "translateX(4px)" : "translateX(0)",
                  transitionTimingFunction: "var(--ease-out)",
                }}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {isDone ? (
                    <svg className="h-4 w-4 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : isActive ? (
                    <div className="h-2 w-2 rounded-full bg-accent-purple animate-pulse" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-text-muted" />
                  )}
                </div>
                <span className="text-sm text-text-secondary">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-purple via-accent-pink to-accent-pink-light"
            style={{ width: `${progress}%`, transition: "width 60ms linear" }}
          />
        </div>
      </div>
    </div>
  );
}
