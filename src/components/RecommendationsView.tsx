"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Button from "./Button";
import RecommendationCard from "./RecommendationCard";
import { recommendations, type Pillar, type Priority } from "@/app/dashboard/rapport/recommendations";

const PRIORITIES: Priority[] = ["P1", "P2", "P3"];
const PRIORITY_LABELS: Record<Priority, string> = { P1: "Élevée", P2: "Moyenne", P3: "Faible" };
const PILLARS: Pillar[] = ["SEO Technique", "SEO Sémantique", "GEO", "Autorité"];

/**
 * Vue Recommandations (client) : l'ensemble des recommandations, filtrables par
 * priorité et par type (pilier). Réutilise RecommendationCard (titre/observation/action).
 */
export default function RecommendationsView({ onExpertClick }: { onExpertClick?: () => void }) {
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [pillar, setPillar] = useState<Pillar | "all">("all");

  const filtered = useMemo(
    () =>
      recommendations.filter(
        (r) => (priority === "all" || r.priority === priority) && (pillar === "all" || r.pillar === pillar),
      ),
    [priority, pillar],
  );

  return (
    <div className="pb-16">
      {/* Filtres */}
      <div className="animate-fade-up relative z-40 mb-6 flex flex-wrap items-center gap-2.5" style={{ animationDelay: "120ms" }}>
        <Dropdown
          label="Priorité"
          value={priority}
          onChange={(v) => setPriority(v as Priority | "all")}
          options={[{ value: "all", label: "Toutes" }, ...PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))]}
        />
        <Dropdown
          label="Type"
          value={pillar}
          onChange={(v) => setPillar(v as Pillar | "all")}
          options={[{ value: "all", label: "Tous" }, ...PILLARS.map((p) => ({ value: p, label: p }))]}
        />
      </div>

      <p className="animate-fade-up mb-4 text-[13px] text-text-muted" style={{ animationDelay: "180ms" }}>
        {filtered.length} recommandation{filtered.length > 1 ? "s" : ""}
        {priority === "all" && pillar === "all" ? "" : " correspondant à vos filtres"}
      </p>

      {/* Liste */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((rec, i) => (
            <RecommendationCard key={rec.title} rec={rec} index={i} delay={220 + i * 50} />
          ))}
        </div>
      ) : (
        <div className="animate-fade-up rounded-xl border border-border-subtle bg-bg-card p-8 text-center text-[14px] text-text-secondary">
          Aucune recommandation ne correspond à ces filtres.
        </div>
      )}

      {/* CTA consultant — même style que la bannière wide */}
      <div
        className="animate-fade-up relative mt-8 flex flex-col overflow-hidden rounded-2xl border border-white/10 lg:flex-row lg:items-stretch"
        style={{
          animationDelay: "300ms",
          background:
            "linear-gradient(180deg, rgba(20,4,18,0.10) 0%, rgba(20,4,18,0.45) 100%), url('/expert-card-bg-wide.jpg') center/cover no-repeat, radial-gradient(120% 80% at 50% 0%, rgba(236,77,203,0.3) 0%, transparent 55%), linear-gradient(160deg, #2b0826 0%, #46103c 100%)",
        }}
      >
        {/* Contenu — à gauche, 48px de padding vertical & horizontal */}
        <div className="relative z-10 flex flex-1 flex-col justify-center gap-3 px-8 py-8 lg:py-12 lg:pl-12 lg:pr-6">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["/consultant1.png", "/consultant2.png", "/consultant3.png"].map((src) => (
                <img key={src} src={src} alt="Consultant" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <span className="text-[12px] font-medium leading-snug text-white/85">
              +500 clients PME, ETI et marques B2B accompagnés
            </span>
          </div>

          <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.4px] text-white">
            Priorisez ce plan d&apos;action avec un expert
          </h3>
          <p className="text-[15px] font-light leading-relaxed text-white/75 md:max-w-[440px]">
            Un consultant AWI vous aide à séquencer ces recommandations sur 90 jours selon votre impact business.
          </p>

          <div>
            <Button variant="primary" onClick={onExpertClick}>
              Parler à un consultant
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-[12px] text-white/85">
            <img src="/google.svg" alt="Google" className="h-3.5 w-3.5" />
            <span>Noté 5.0 sur 50+ avis</span>
            <span className="flex -space-x-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="#FBBF24">
                  <path d="M11.48 3.5a.562.562 0 0 1 1.04 0l2.125 5.11a.563.563 0 0 0 .475.346l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.884a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.563.563 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              ))}
            </span>
          </div>
        </div>

        {/* Image experts — à droite, padding 48 à droite, collée en bas */}
        <div className="hidden shrink-0 self-stretch lg:flex lg:w-[440px] lg:items-end lg:justify-end lg:pr-12">
          <img
            src="/expertswidedivcta.png"
            alt=""
            className="pointer-events-none max-h-full w-auto max-w-full object-contain object-bottom"
          />
        </div>
      </div>
    </div>
  );
}

function Dropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const active = value !== "all";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border py-2 pl-3.5 pr-2.5 text-[13px] font-medium transition-colors duration-200 ${
          active
            ? "border-accent-pink/50 bg-accent-pink/10 text-text-primary"
            : "border-border-subtle bg-card-inner-bg text-text-secondary hover:border-border-badge hover:text-text-primary"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <span>
          {label}
          {active && <span className="text-text-primary"> · {selected?.label}</span>}
        </span>
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""} ${active ? "text-accent-pink" : "text-text-muted"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div
        className="absolute left-0 top-full z-50 mt-2 min-w-[190px] overflow-hidden rounded-xl border border-border-subtle bg-modal-bg p-1 shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0) scale(1)" : "translateY(-4px) scale(0.97)",
            pointerEvents: open ? "auto" : "none",
            transitionTimingFunction: "var(--ease-out)",
          }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-150 hover:bg-card-inner-bg ${
                o.value === value ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              {o.label}
              {o.value === value && (
                <svg className="h-3.5 w-3.5 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
    </div>
  );
}
