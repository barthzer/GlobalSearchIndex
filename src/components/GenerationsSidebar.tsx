"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";
import { useGeneration } from "./GenerationProvider";
import NewAnalysisModal from "./NewAnalysisModal";
import ClientInfoModal from "./ClientInfoModal";
import AWILogoCompact from "./AWILogoCompact";

export default function GenerationsSidebar() {
  const { selected, setSelectedId, all: generations, collapsed, toggleCollapsed } = useGeneration();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [userModal, setUserModal] = useState<{ id: string; name: string } | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const prevIdsRef = useRef<string>("");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const filtered = useMemo(() =>
    generations.filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.url.toLowerCase().includes(search.toLowerCase())
    ), [search, generations]);

  const filteredIds = filtered.map((g) => g.id).join(",");
  const listChanged = filteredIds !== prevIdsRef.current;
  if (listChanged) prevIdsRef.current = filteredIds;

  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-3 left-3 z-20 hidden h-[calc(100vh-24px)] flex-col rounded-2xl border border-border-subtle bg-bg-sidebar transition-all duration-300 lg:flex ${collapsed ? "w-[68px]" : "w-[280px]"}`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      {/* Fixed top: Logo + Toggle */}
      <div className={`shrink-0 pt-6 pb-3 ${collapsed ? "px-3" : "px-5"}`}>
        <div className="mb-5 flex items-center justify-between">
          {!collapsed && (
            <a href="/" className="flex flex-col leading-tight">
              <span className="text-[20px] tracking-[-1.2px] text-text-primary">
                <span className="font-semibold">GlobalSearch</span>
                <span className="font-normal">Index</span>
              </span>
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-text-primary">
                By <AWILogoCompact className="h-[12px] w-auto text-text-primary" />
              </span>
            </a>
          )}
          <div className={`flex items-center gap-2 ${collapsed ? "mx-auto flex-col" : ""}`}>
            <button
              onClick={() => setShowNewAnalysis(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-card text-text-muted transition-all duration-200 hover:bg-bg-card-hover hover:text-text-primary active:scale-[0.95]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
              title="Nouvelle analyse"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button
              onClick={toggleCollapsed}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-card text-text-muted transition-all duration-200 hover:bg-bg-card-hover hover:text-text-primary active:scale-[0.95]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
              title={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <path d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search — hidden when collapsed */}
        {!collapsed && <div className="relative">
          <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-full border border-border-subtle bg-input-bg py-2 pl-9 pr-9 text-[13px] text-text-primary placeholder:text-text-muted outline-none transition-colors duration-200 focus:border-accent-pink/30"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          />
          {/* Clear button */}
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-0 bottom-0 my-auto flex h-5 w-5 items-center justify-center rounded-full text-text-muted transition-all duration-200 hover:bg-card-inner-bg hover:text-text-primary"
            style={{
              opacity: search ? 1 : 0,
              scale: search ? "1" : "0.8",
              pointerEvents: search ? "auto" : "none",
              transitionTimingFunction: "var(--ease-out)",
            }}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>}
      </div>

      {/* Scrollable generations list */}
      <div className={`flex-1 overflow-y-auto pb-3 ${collapsed ? "px-2" : "px-3"}`}>
        {!collapsed && <p className="px-2 pb-3 pt-1 text-[16px] font-medium text-text-primary">
          Vos générations
        </p>}
        <div className="flex flex-col gap-1" key={filteredIds}>
          {filtered.map((gen, i) => collapsed ? (
            <button
              key={gen.id}
              onClick={() => setSelectedId(gen.id)}
              className={`flex items-center justify-center rounded-xl py-2 transition-all duration-200 ${
                selected.id === gen.id ? "bg-bg-card" : "hover:bg-card-inner-bg"
              }`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
              title={gen.name}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gen.color} text-[11px] font-bold text-white`}>
                {gen.initial}
              </div>
            </button>
          ) : (
            <div
              key={gen.id}
              className={`group/item relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 cursor-pointer ${
                menuOpen === gen.id ? "z-30" : ""
              } ${
                selected.id === gen.id
                  ? "bg-bg-card border border-border-subtle"
                  : "border border-transparent hover:bg-card-inner-bg"
              }`}
              style={{
                transitionTimingFunction: "var(--ease-out)",
                animation: `fade-up 300ms var(--ease-expo) ${i * 30}ms both`,
              }}
              onClick={() => setSelectedId(gen.id)}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gen.color} text-[11px] font-bold text-white`}>
                {gen.initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-text-primary">{gen.name}</p>
                <p className="text-[11px] text-text-muted">{gen.date}</p>
              </div>

              {/* 3-dots button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === gen.id ? null : gen.id);
                }}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-muted transition-all duration-200 hover:bg-bg-card hover:text-text-primary ${
                  menuOpen === gen.id ? "opacity-100" : "opacity-0 group-hover/item:opacity-100"
                }`}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {menuOpen === gen.id && (
                <div
                  className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-border-subtle bg-modal-bg p-1.5 shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.3)]"
                  style={{ animation: "fade-up 150ms var(--ease-expo) both" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setMenuOpen(null)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-card-inner-bg hover:text-text-primary"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                    Partager
                  </button>
                  <button
                    onClick={() => setMenuOpen(null)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-card-inner-bg hover:text-text-primary"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
                    </svg>
                    Relancer l&apos;analyse
                  </button>
                  <button
                    onClick={() => { setUserModal({ id: gen.id, name: gen.name }); setMenuOpen(null); }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-card-inner-bg hover:text-text-primary"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    Utilisateur
                  </button>
                  <div className="my-1 h-px bg-border-subtle" />
                  <button
                    onClick={() => setMenuOpen(null)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-400 transition-colors duration-150 hover:bg-red-500/10"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
          {!collapsed && filtered.length === 0 && (
            <p
              className="px-3 py-6 text-center text-[12px] text-text-muted"
              style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
            >
              Aucune génération trouvée.
            </p>
          )}
        </div>
      </div>


      {showNewAnalysis && <NewAnalysisModal onClose={() => setShowNewAnalysis(false)} />}
      {userModal && (
        <ClientInfoModal genId={userModal.id} genName={userModal.name} onClose={() => setUserModal(null)} />
      )}
    </aside>
  );
}
