"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount } from "./AccountProvider";
import { useTheme } from "./ThemeProvider";
import { resetTour } from "./TutorialModal";
import AccountAvatar from "./AccountAvatar";
import LoginModal from "./LoginModal";

function ThemeIcon({ theme }: { theme: "dark" | "light" }) {
  return theme === "dark" ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  );
}

export default function ProfileMenu() {
  const { account, accounts, switchAccount, login, logout, isLoggedIn } = useAccount();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!isLoggedIn) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-sm text-text-secondary transition-colors duration-200 hover:text-text-primary"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          Connexion
        </button>
        {open && <LoginModal onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center rounded-full transition-all duration-200 hover:opacity-90 active:scale-[0.95]"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <AccountAvatar name={account?.name ?? ""} avatar={account?.avatar} size={32} />
      </button>

      {/* Dropdown */}
      <div
        className="absolute right-0 top-10 w-64 overflow-hidden rounded-xl border border-border-subtle bg-modal-bg shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.3)] transition-all duration-200"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(-4px) scale(0.97)",
          pointerEvents: open ? "auto" : "none",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        {/* Current account */}
        <div className="border-b border-border-subtle p-4">
          <div className="flex items-center gap-3">
            <AccountAvatar name={account?.name ?? ""} avatar={account?.avatar} size={36} className="shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-text-primary">{account?.name}</p>
                <span className="rounded-full border border-border-subtle bg-card-inner-bg px-1.5 py-0.5 text-[9px] text-text-muted">
                  {account?.type === "admin" ? "Admin" : "Client"}
                </span>
              </div>
              <p className="truncate text-[11px] text-text-muted">{account?.email}</p>
            </div>
          </div>
        </div>

        {/* Switch accounts */}
        <div className="p-2">
          <p className="px-2 pb-1 pt-1 text-[10px] font-medium uppercase tracking-[0.8px] text-text-muted">
            Changer de compte
          </p>
          {accounts
            .filter((a) => a.type !== account?.type)
            .map((a) => (
              <button
                key={a.type}
                onClick={() => {
                  switchAccount(a.type);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-card-inner-bg"
              >
                <AccountAvatar name={a.name} avatar={a.avatar} size={32} className="shrink-0" />
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm text-text-primary">{a.name}</p>
                  <p className="truncate text-[11px] text-text-muted">
                    {a.type === "admin" ? "Administrateur" : "Client"}
                  </p>
                </div>
              </button>
            ))}
        </div>

        {/* Settings + logout */}
        <div className="border-t border-border-subtle p-2">
          {/* Thème jour/nuit */}
          <button
            onClick={toggle}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-card-inner-bg hover:text-text-primary"
          >
            <span className="flex items-center gap-2">
              <ThemeIcon theme={theme} />
              Thème {theme === "dark" ? "sombre" : "clair"}
            </span>
            <span
              className={`relative h-5 w-9 rounded-full border transition-colors duration-200 ${
                theme === "dark" ? "border-accent-pink/40 bg-accent-pink/20" : "border-border-subtle bg-card-inner-bg"
              }`}
            >
              <span
                className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-text-primary transition-all duration-200"
                style={{ left: theme === "dark" ? "18px" : "2px", transitionTimingFunction: "var(--ease-out)" }}
              />
            </span>
          </button>
          <button
            onClick={() => { resetTour(); window.location.assign("/dashboard"); }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-card-inner-bg hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
            Revoir le tutoriel
          </button>
          <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-card-inner-bg hover:text-text-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Paramètres du compte
          </button>
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-card-inner-bg hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
