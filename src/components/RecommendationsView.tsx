"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Button from "./Button";
import RecommendationCard from "./RecommendationCard";
import { recommendations, type Pillar, type Priority } from "@/app/dashboard/rapport/recommendations";

const PRIORITIES: Priority[] = ["P1", "P2", "P3"];
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
          options={[{ value: "all", label: "Toutes" }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]}
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

      {/* CTA consultant */}
      <div
        className="animate-fade-up relative mt-8 overflow-hidden rounded-2xl border border-[#ec4dcb]/20 p-6 md:p-8"
        style={{ background: "linear-gradient(135deg, rgba(95,20,251,0.15) 0%, rgba(236,77,203,0.2) 100%)" }}
      >
        <div className="mb-4 flex -space-x-2">
          {["/consultant1.png", "/consultant2.png", "/consultant3.png"].map((src) => (
            <img key={src} src={src} alt="Consultant" className="h-9 w-9 rounded-full border-2 border-bg-primary object-cover" />
          ))}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-text-primary">Priorisez ce plan d&apos;action avec un expert</h3>
        <p className="mb-5 text-[length:var(--text-body)] font-extralight leading-relaxed text-text-secondary">
          Un consultant AWI vous aide à séquencer ces recommandations sur 90 jours selon votre impact business.
        </p>
        <Button variant="primary" onClick={onExpertClick}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
          Parler à un consultant
        </Button>
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
