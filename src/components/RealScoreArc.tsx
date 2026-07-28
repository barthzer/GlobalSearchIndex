"use client";

import type { ScoreDisplay } from "@/lib/scores";

// Arc rendu À PARTIR du display serveur. Le front ne décide NI le régime, NI le
// scorable, NI la neutralité — il rend. Seule la teinte du dégradé RELATIF dérive
// de la valeur (présentation pure, comme l'ancien front prospect) ; la décision
// « neutre » vient du serveur (neutralArc).
const NEUTRAL = { start: "#9ca3af", end: "#cbd5e1" };
function valueGradient(v: number): { start: string; end: string } {
  if (v < 50) return { start: "#ef4444", end: "#f97316" };
  if (v < 75) return { start: "#f97316", end: "#eab308" };
  return { start: "#22c55e", end: "#4ade80" };
}

const ARC_PATH =
  "M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301";

export default function RealScoreArc({
  label,
  icon,
  display,
}: {
  label: string;
  icon: React.ReactNode;
  display: ScoreDisplay;
}) {
  const radius = 86.33;
  const circumference = Math.PI * radius;
  const gradientId = `arc-${label.replace(/\s/g, "-")}`;

  // ② NON SCORABLE → message, JAMAIS un chiffre.
  if (!display.scorable || display.value == null) {
    return (
      <div className="flex flex-col rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
        <div className="mb-4 flex w-full items-center gap-2">
          <span className="text-text-primary/80">{icon}</span>
          <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
            {label}
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-inner-bg">
            <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <p className="max-w-[16rem] text-[13px] leading-relaxed text-text-muted">
            {display.message ?? "Non calculable"}
          </p>
        </div>
      </div>
    );
  }

  const value = display.value;
  // ① COULEUR : GRISE si régime neutre (absolu ou confiance réduite) — décision
  // SERVEUR (neutralArc). Sinon dégradé par valeur (relatif).
  const col = display.neutralArc ? NEUTRAL : valueGradient(value);
  const pct = Math.min(Math.max(value, 0), 100) / 100;
  const offset = circumference - pct * circumference;

  return (
    <div className="group relative flex flex-col items-center rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
      <div className="mb-4 flex w-full items-center gap-2">
        <span className="text-text-primary/80">{icon}</span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
          {label}
          {/* Régime absolu : le chiffre est un BAS, pas un /100 comparable. */}
          {display.absolute && (
            <span className="ml-1.5 text-[12px] font-normal text-text-muted">
              (absolu)
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2.5">
        <div className="relative">
          <svg viewBox="0 0 181 95" className="h-24 w-44">
            <path d={ARC_PATH} fill="none" stroke="var(--arc-bg)" strokeWidth="8" strokeLinecap="round" />
            <path
              d={ARC_PATH}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s var(--ease-in-out)" }}
            />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={col.start} />
                <stop offset="100%" stopColor={col.end} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-end justify-center">
            <span className="text-3xl font-bold tabular-nums text-text-primary">
              {value}
            </span>
            {/* Pas de « /100 » sur un BAS absolu (échelle non comparable). */}
            {!display.absolute && (
              <span className="mb-1 text-sm text-text-muted">/100</span>
            )}
          </div>
        </div>

        {/* Caveat/label du régime (confiance réduite, absolu…) — texte serveur. */}
        {display.message && (
          <p className="max-w-[18rem] text-center text-[12px] leading-relaxed text-text-muted">
            {display.message}
          </p>
        )}
      </div>
    </div>
  );
}
