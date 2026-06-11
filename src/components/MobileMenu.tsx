"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import ProfileMenu from "./ProfileMenu";
import { useAccount } from "./AccountProvider";
import AWILogoCompact from "./AWILogoCompact";
import { useGeneration } from "./GenerationProvider";
import NewAnalysisModal from "./NewAnalysisModal";

interface MobileMenuProps {
  onClose: () => void;
  onExpertClick?: () => void;
}

export default function MobileMenu({ onClose, onExpertClick }: MobileMenuProps) {
  const { isAdmin } = useAccount();
  const { selected, setSelectedId, all: generations } = useGeneration();
  const [search, setSearch] = useState("");
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const filtered = generations.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        className="absolute inset-0 bg-bg-primary/90 backdrop-blur-xl"
        style={{ animation: "fade-up 200ms var(--ease-expo) both" }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-5">
        <a href="/" className="flex flex-col leading-tight">
          <span className="text-[20px] tracking-[-1.2px] text-text-primary">
            <span className="font-semibold">GlobalSearch</span>
            <span className="font-normal">Index</span>
          </span>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-text-primary">
            By <AWILogoCompact className="h-[12px] w-auto text-text-primary" />
          </span>
        </a>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-card text-text-primary transition-all duration-200 hover:bg-bg-card-hover active:scale-[0.95]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {isAdmin ? (
          /* Admin: generations list */
          <div className="flex flex-1 flex-col px-6">
            {/* Search */}
            <div className="relative mb-4" style={{ animation: "fade-up 300ms var(--ease-expo) 100ms both" }}>
              <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une analyse..."
                className="w-full rounded-full border border-border-subtle bg-input-bg py-2.5 pl-9 pr-9 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-colors duration-200 focus:border-accent-pink/30"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <p
              className="mb-2 px-1 text-[14px] font-medium text-text-primary"
              style={{ animation: "fade-up 300ms var(--ease-expo) 150ms both" }}
            >
              Vos générations
            </p>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto pb-4">
              <div className="flex flex-col gap-1">
                {filtered.map((gen, i) => (
                  <button
                    key={gen.id}
                    onClick={() => { setSelectedId(gen.id); onClose(); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                      selected.id === gen.id
                        ? "bg-bg-card border border-border-subtle"
                        : "border border-transparent hover:bg-card-inner-bg"
                    }`}
                    style={{
                      transitionTimingFunction: "var(--ease-out)",
                      animation: `fade-up 300ms var(--ease-expo) ${200 + i * 30}ms both`,
                    }}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gen.color} text-[12px] font-bold text-white`}>
                      {gen.initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-text-primary">{gen.name}</p>
                      <p className="text-[12px] text-text-muted">{gen.date}</p>
                    </div>
                    {selected.id === gen.id && (
                      <svg className="h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="py-8 text-center text-[13px] text-text-muted">
                    Aucune génération trouvée.
                  </p>
                )}
              </div>
            </div>

            {/* New analysis button */}
            <div
              className="shrink-0 border-t border-border-subtle py-4"
              style={{ animation: "fade-up 300ms var(--ease-expo) 250ms both" }}
            >
              <button
                onClick={() => setShowNewAnalysis(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-card px-4 py-3 text-[14px] font-medium text-text-primary transition-all duration-200 hover:bg-bg-card-hover active:scale-[0.98]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nouvelle analyse
              </button>
            </div>
          </div>
        ) : (
          /* User: nav items */
          <nav className="flex flex-1 flex-col gap-2 px-6 pt-4">
            <a
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-4 text-[18px] font-medium text-text-primary transition-colors duration-200 hover:bg-bg-card"
              style={{ animation: "fade-up 300ms var(--ease-expo) 100ms both" }}
            >
              <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Accueil
            </a>

            <button
              onClick={() => { onExpertClick?.(); onClose(); }}
              className="flex items-center gap-3 rounded-xl px-4 py-4 text-left text-[18px] font-medium text-text-primary transition-colors duration-200 hover:bg-bg-card"
              style={{ animation: "fade-up 300ms var(--ease-expo) 150ms both" }}
            >
              <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
              </svg>
              Parler à un expert
            </button>

            <a
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-4 text-[18px] font-medium text-text-primary transition-colors duration-200 hover:bg-bg-card"
              style={{ animation: "fade-up 300ms var(--ease-expo) 200ms both" }}
            >
              <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nouvelle analyse
            </a>
          </nav>
        )}
      </div>

      {/* Bottom */}
      <div className="relative flex flex-col gap-4 border-t border-border-subtle px-6 py-6">
        <div
          className="flex items-center justify-between"
          style={{ animation: "fade-up 300ms var(--ease-expo) 250ms both" }}
        >
          <span className="text-sm text-text-secondary">Thème</span>
          <ThemeToggle />
        </div>
        <div
          className="flex items-center justify-between"
          style={{ animation: "fade-up 300ms var(--ease-expo) 300ms both" }}
        >
          <span className="text-sm text-text-secondary">Compte</span>
          <ProfileMenu />
        </div>
      </div>

      {showNewAnalysis && <NewAnalysisModal onClose={() => setShowNewAnalysis(false)} />}
    </div>
  );
}
