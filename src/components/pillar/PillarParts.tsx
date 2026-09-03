"use client";

import { bandLabel, type ScoreBand } from "@/lib/scoreLabel";

/** Bande serveur (display.band) — l'unique source de vérité couleur. */
type Band = "critical" | "medium" | "good";

/**
 * Couleur d'un score depuis sa BANDE SERVEUR (jamais un seuil recalculé côté
 * front — invariant « 56 vs 12 »). Rouge critical, ambre medium, vert good.
 * Le geo peut rétrograder good→medium au-dessus de 75 (plancher citations) :
 * la couleur suit la bande, pas le chiffre.
 */
export function bandColors(band: Band) {
  if (band === "critical") return { start: "#ef4444", end: "#f97316" };
  if (band === "medium") return { start: "#f97316", end: "#eab308" };
  return { start: "#16a34a", end: "#4ade80" };
}

const ARC_PATH =
  "M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301";
const ARC_RADIUS = 86.33;
const ARC_CIRC = Math.PI * ARC_RADIUS;

/**
 * Jauge demi-cercle : chiffre au centre, chip d'interprétation dessous. La
 * COULEUR (arc + chip) vient de la bande SERVEUR (`band`), pas du score : le
 * front ne rejoue aucun seuil. Le `score` ne pilote que le remplissage et le
 * nombre affiché.
 */
export function ScoreGauge({
  score,
  band,
  visible,
  size = "lg",
  delay = 0,
  gradientId,
}: {
  score: number;
  band: Band;
  visible: boolean;
  size?: "lg" | "sm";
  delay?: number;
  gradientId: string;
}) {
  const col = bandColors(band);
  const offset = ARC_CIRC - (score / 100) * ARC_CIRC;
  const big = size === "lg";

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className="relative">
        <svg viewBox="0 0 181 95" className={big ? "h-24 w-44" : "h-[72px] w-[136px]"}>
          <path d={ARC_PATH} fill="none" stroke="var(--arc-bg)" strokeWidth="8" strokeLinecap="round" />
          <path
            d={ARC_PATH}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={ARC_CIRC}
            strokeDashoffset={visible ? offset : ARC_CIRC}
            style={{ transition: `stroke-dashoffset 1.2s var(--ease-expo) ${delay}ms` }}
          />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={col.start} />
              <stop offset="100%" stopColor={col.end} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-end justify-center">
          <span className={`font-bold tabular-nums text-text-primary ${big ? "text-3xl" : "text-2xl"}`}>{score}</span>
          <span className={`text-text-muted ${big ? "mb-1 text-sm" : "mb-0.5 text-[12px]"}`}>/100</span>
        </div>
      </div>
      <span className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${bandLabel(band).chip}`}>
        {bandLabel(band).label}
      </span>
    </div>
  );
}

/**
 * En-tête d'un bloc pilier : icône en pastille (même traitement que les icônes
 * sous les barres du « Score par pilier ») + titre.
 */
export function PillarHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex w-full items-center gap-2.5 px-5 pt-5 md:px-6 md:pt-6">
      <PillarIcon>{icon}</PillarIcon>
      <span className="text-xl font-medium tracking-tight text-text-heading">{title}</span>
    </div>
  );
}

/** Pastille d'icône commune (carré arrondi contour + fond en relief). */
export function PillarIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="icon-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary">
      {children}
    </span>
  );
}

/** Carte de sous-score d'un pilier (titre + contenu libre). */
export function SubCard({
  icon,
  title,
  onInfo,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  onInfo?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-outline rounded-2xl p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="icon-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-secondary">{icon}</span>
        <span className="text-[14px] font-medium text-text-primary">{title}</span>
        {onInfo && <InfoButton onClick={onInfo} label={`Informations sur le score ${title}`} />}
      </div>
      {children}
    </div>
  );
}

/** Bouton « i » d'explication d'un score. */
export function InfoButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center hover-surface rounded-full border border-border-subtle bg-card-inner-bg text-text-muted transition-all duration-200 active:scale-[0.95]"
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
      </svg>
    </button>
  );
}

export type { ScoreBand };
