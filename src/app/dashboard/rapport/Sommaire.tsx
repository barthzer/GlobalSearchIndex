"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "page-cover", label: "Couverture" },
  { id: "page-analyse", label: "Analyse" },
  { id: "page-recommandations", label: "Recommandations" },
  { id: "page-concurrence", label: "Concurrence" },
  { id: "page-notoriete", label: "Notoriété" },
];

export default function Sommaire() {
  const [activeId, setActiveId] = useState("page-cover");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="no-print fixed right-6 top-6 z-50 w-[200px] p-1">
      <div className="px-3 pb-2 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-text-muted">
        Sommaire
      </div>
      <ol className="flex flex-col gap-1.5">
        {sections.map((s, i) => {
          const isActive = activeId === s.id;
          return (
            <li key={s.id}>
              <button
                onClick={() => scrollTo(s.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-white font-medium text-text-primary"
                    : "font-light text-text-secondary hover:bg-white/60 hover:text-text-primary"
                }`}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <span
                  className={`text-[11px] font-semibold tabular-nums ${
                    isActive ? "text-accent-pink" : "text-text-muted"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
