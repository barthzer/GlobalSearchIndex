"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { bandColors } from "./pillar/PillarParts";

// Barres verticales « Score par pilier » (refonte 3 piliers, 2026-09-03) — portage
// fidèle du PillarBars de Barth (GSI-Front origin/main), DANS la carte Score global.
// NOS 3 piliers : GEO, SEO (composite), Autorité. Chaque barre est un raccourci vers
// le bloc complet (#pilier-*), avec tooltip explicatif au survol (rendu en portail).
//
// COULEUR = bande SERVEUR (display.band), jamais un seuil recalculé côté front
// (invariant « 56 vs 12 »). Le classement GSI de Barth est OMIS (donnée non produite).

type Band = "critical" | "medium" | "good";

export interface PillarBar {
  /** Libellé court sous la barre (GEO / SEO / Autorité). */
  short: string;
  /** Titre de la tooltip. */
  name: string;
  /** Description de la tooltip. */
  desc: string;
  /** Score /100 serveur, ou null (pilier non mesuré). */
  score: number | null;
  /** Bande serveur (couleur de la barre). null → piste neutre. */
  band: Band | null;
  /** Ancre du bloc complet (scroll-to au clic). */
  anchor: string;
  icon: React.ReactNode;
}

/** Amène l'utilisateur au bloc détaillé du pilier cliqué. */
function scrollToPillar(anchor: string) {
  const el = document.getElementById(anchor);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 90;
  window.scrollTo({ top, behavior: "smooth" });
}

/** Hauteur max d'une tooltip + marge : en deçà, elle bascule dessous. */
const TOOLTIP_SAFE_HEIGHT = 230;
const TOOLTIP_WIDTH = 230;

export default function PillarBars({
  pillars,
  animate,
  computing = false,
}: {
  pillars: PillarBar[];
  animate: boolean;
  computing?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  // Tooltip rendue en portail : dans la carte, elle passait sous la section
  // suivante (contexte d'empilement). Position en coordonnées écran, avec bascule
  // au-dessus/en dessous et recadrage horizontal. Le survol n'arrive que côté
  // client → garde `typeof document` suffit (pas d'état de montage, pas de setState
  // synchrone en effet).
  const [anchor, setAnchor] = useState<{ x: number; y: number; below: boolean } | null>(null);

  function openTooltip(i: number, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    const below = r.top < TOOLTIP_SAFE_HEIGHT;
    const half = TOOLTIP_WIDTH / 2;
    const x = Math.min(
      Math.max(r.left + r.width / 2, half + 8),
      window.innerWidth - half - 8,
    );
    setAnchor({ x, y: below ? r.bottom + 8 : r.top - 8, below });
    setHovered(i);
  }

  function closeTooltip() {
    setHovered(null);
    setAnchor(null);
  }

  return (
    <div className="surface-outline w-full flex-1 rounded-2xl p-4">
      <div className="mb-4 text-[13px] font-medium text-text-secondary">Score par pilier</div>
      <div className="flex items-stretch gap-3">
        {/* Axe : 100 / 50 / 0 */}
        <div className="flex h-[174px] flex-col justify-between pb-0 text-right text-[11px] font-light leading-none text-text-muted">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
        <div className="relative flex-1">
          {/* Lignes de repère */}
          {[50, 100].map((v) => (
            <div
              key={v}
              className="absolute inset-x-0 border-t border-dashed"
              style={{ bottom: `calc(${v} / 100 * 174px)`, borderColor: "var(--arc-bg)" }}
            />
          ))}
          <div className="relative z-10 flex items-end justify-around">
            {pillars.map((p, i) => {
              const col = p.band ? bandColors(p.band) : null;
              return (
                <div
                  key={p.anchor}
                  role="button"
                  tabIndex={0}
                  onClick={() => scrollToPillar(p.anchor)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      scrollToPillar(p.anchor);
                    }
                  }}
                  className="relative flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-2xl px-4 py-2 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent-pink/40"
                  style={{
                    backgroundColor:
                      hovered === i ? "color-mix(in srgb, var(--text-primary) 3%, transparent)" : "transparent",
                    transitionTimingFunction: "var(--ease-out)",
                  }}
                  onMouseEnter={(e) => openTooltip(i, e.currentTarget)}
                  onFocus={(e) => openTooltip(i, e.currentTarget)}
                  onMouseLeave={closeTooltip}
                  onBlur={closeTooltip}
                >
                  {/* Tooltip — portail, hors du contexte d'empilement de la carte */}
                  {typeof document !== "undefined" &&
                    hovered === i &&
                    anchor &&
                    createPortal(
                      <div
                        className="tooltip-surface pointer-events-none fixed z-[95] w-[230px] rounded-2xl p-4"
                        style={{
                          left: anchor.x,
                          top: anchor.y,
                          transform: `translate(-50%, ${anchor.below ? "0" : "-100%"})`,
                          animation: "fade-in 160ms var(--ease-out) both",
                        }}
                      >
                        <div className="text-[15px] font-semibold">{p.name}</div>
                        <div className="tooltip-divider my-2.5 border-t" />
                        <p className="tooltip-muted text-[12px] font-light leading-relaxed">{p.desc}</p>
                        <div className="mt-2.5 flex items-end justify-between gap-3">
                          {computing || p.score === null ? (
                            <div className="tooltip-muted text-[12px] font-medium">
                              {computing ? "Calcul en cours…" : "Non mesuré"}
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold leading-none tabular-nums">{p.score}</span>
                              <span className="tooltip-muted text-[12px]">/100</span>
                            </div>
                          )}
                          <svg className="tooltip-muted h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 -960 960 960">
                            <path d="M256-240l-56-56 384-384H240v-80h480v480h-80v-344L256-240Z" />
                          </svg>
                        </div>
                      </div>,
                      document.body,
                    )}

                  {/* Piste + barre : dégradé au code couleur de la BANDE serveur */}
                  {computing ? (
                    <div
                      className="relative h-[174px] w-7 overflow-hidden rounded-full"
                      style={{ backgroundColor: "var(--arc-bg)", opacity: 0.9 }}
                      aria-hidden="true"
                    >
                      <div
                        className="animate-pillar-loading absolute inset-x-0 top-0 h-[70%]"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
                          animationDelay: `${i * 0.25}s`,
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="relative h-[174px] w-7 overflow-hidden rounded-full"
                      style={{ backgroundColor: "var(--arc-bg)", opacity: 0.9 }}
                    >
                      {p.score !== null && col && (
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-full"
                          style={{
                            height: animate ? `${p.score}%` : "0%",
                            background: `linear-gradient(to top, ${col.start}, ${col.end})`,
                            transition: `height 900ms var(--ease-expo) ${200 + i * 120}ms`,
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Icône + nom du pilier */}
                  <div
                    className={`icon-badge flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 ${
                      hovered === i ? "icon-badge-hover text-accent-pink" : "text-text-secondary"
                    }`}
                  >
                    {p.icon}
                  </div>
                  <span className="text-[11px] font-medium text-text-secondary">{p.short}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
