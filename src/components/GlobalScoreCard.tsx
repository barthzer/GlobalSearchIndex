"use client";

import { useEffect, useState } from "react";
import { scoreBand } from "@/lib/scoreLabel";
import { analyseScores, globalScore } from "@/app/dashboard/rapport/scores";

function scoreColors(s: number) {
  if (s < 50) return { start: "#ef4444", end: "#f97316" };
  if (s < 75) return { start: "#f97316", end: "#eab308" };
  return { start: "#22c55e", end: "#4ade80" };
}

/** Formulation lisible de chaque pilier pour la phrase de synthèse (forme en milieu de phrase). */
const PILLAR_PHRASES: Record<string, string> = {
  "SEO Technique": "votre SEO technique",
  "SEO Sémantique": "votre SEO sémantique",
  GEO: "votre visibilité GEO dans les moteurs d'IA",
  Autorité: "l'autorité de votre site",
};

function pillarPhrase(label: string) {
  return PILLAR_PHRASES[label] ?? label;
}

/** Même formulation, avec majuscule initiale (début de phrase). */
function pillarSubject(label: string) {
  const p = pillarPhrase(label);
  return p.charAt(0).toUpperCase() + p.slice(1);
}

/**
 * Score global de visibilité : moyenne des 4 piliers audités
 * (GEO, technique, sémantique, autorité). Affiché en tête de la vue Analyse.
 */
export default function GlobalScoreCard({ delay = 0 }: { delay?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const band = scoreBand(globalScore);
  const col = scoreColors(globalScore);

  // Pilier le plus solide + piliers les plus faibles, pour une lecture concrète du score.
  const audited = analyseScores
    .filter((s): s is (typeof analyseScores)[number] & { score: number } => s.score !== null)
    .sort((a, b) => b.score - a.score);
  const bestPillar = audited[0];
  const weakest = audited.slice(-2).reverse();
  const weakList = weakest
    .map((s) => `${pillarPhrase(s.label)} (${s.score}/100)`)
    .join(" et ");

  // Même épaisseur visuelle que les demi-jauges des cartes de score (trait de 8).
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (globalScore / 100) * circumference;

  return (
    <div
      className="rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo)",
      }}
    >
      <div className="flex flex-col gap-6 p-5 md:flex-row md:items-center md:gap-10 md:p-6">
        {/* Grand anneau + interprétation */}
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left md:shrink-0">
          <div className="relative h-[180px] w-[180px] shrink-0">
            <svg viewBox="0 0 180 180" className="h-full w-full">
              <defs>
                <linearGradient id="global-score-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={col.start} />
                  <stop offset="100%" stopColor={col.end} />
                </linearGradient>
              </defs>
              <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--arc-bg)" strokeWidth={8} />
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="url(#global-score-grad)"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={visible ? offset : circumference}
                transform="rotate(-90 90 90)"
                style={{ transition: "stroke-dashoffset 1200ms var(--ease-expo)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
              {/* Éclair : repère visuel du score global */}
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--arc-bg)" }}
              >
                {/* L'éclair reprend le dégradé de l'anneau (couleur du score) */}
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="global-score-bolt-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={col.start} />
                      <stop offset="100%" stopColor={col.end} />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#global-score-bolt-grad)"
                    d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                  />
                </svg>
              </span>
              <span className="flex items-baseline">
                <span className="text-3xl font-bold tabular-nums leading-none text-text-primary">
                  {globalScore}
                </span>
                <span className="ml-0.5 text-sm text-text-muted">/100</span>
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
              Score global
            </h2>
            <span className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${band.chip}`}>
              {band.label}
            </span>
          </div>
        </div>

        {/* Lecture du score : où vous en êtes, ce qui porte, ce qui freine.
            TODO(backend): ce texte est genere par une regle simple (meilleur pilier + 2 plus faibles).
            En production, creer un prompt d'interpretation (LLM) qui recoit les 4 scores + le score
            global et redige cette synthese : meme structure (constat, point fort, points faibles,
            ou sont les gains), 3-4 phrases max, ton non technique pour un dirigeant, pas de jargon.
            Garder la version calculee ci-dessous comme fallback si la generation echoue. */}
        <p className="flex-1 text-[14px] font-light leading-relaxed text-text-secondary md:max-w-[520px]">
          Votre visibilité est <strong className="font-medium text-text-primary">bien engagée, mais encore inégale</strong>.{" "}
          {pillarSubject(bestPillar.label)} est le pilier le plus solide ({bestPillar.score}/100) et constitue
          un socle sain pour progresser. À l&apos;inverse, {`${weakList} tirent `}votre moyenne vers le bas : c&apos;est
          là que se trouvent vos <strong className="font-medium text-text-primary">gains de visibilité les plus rapides</strong>.
        </p>
      </div>
    </div>
  );
}
