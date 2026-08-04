"use client";

import ModalPortal from "./ModalPortal";


import { useState } from "react";
import Button from "./Button";

const FREE_DOMAINS = [
  "gmail.com", "yahoo.com", "yahoo.fr", "hotmail.com", "hotmail.fr",
  "outlook.com", "outlook.fr", "live.com", "live.fr", "aol.com",
  "icloud.com", "me.com", "mac.com", "mail.com", "protonmail.com",
  "proton.me", "gmx.com", "gmx.fr", "yandex.com", "zoho.com",
  "free.fr", "orange.fr", "sfr.fr", "laposte.net", "wanadoo.fr",
  "bbox.fr", "numericable.fr",
];

interface EmailModalProps {
  url: string;
  onSubmit: (email: string) => void;
  onClose: () => void;
}

export default function EmailModal({ url, onSubmit, onClose }: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function validate(value: string): string {
    if (!value.trim()) return "Veuillez entrer votre email professionnel.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Format d'email invalide.";
    const domain = value.split("@")[1].toLowerCase();
    if (FREE_DOMAINS.includes(domain)) {
      return "Veuillez utiliser votre adresse email professionnelle.";
    }
    return "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(email);
    if (err) {
      setError(err);
      return;
    }
    onSubmit(email.trim());
  }

  return (
    <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
        onClick={onClose}
        style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
      />

      {/* Double-Bezel: Outer Shell */}
      <div
        className="relative w-full max-w-[440px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2"
        style={{ animation: "fade-up 400ms var(--ease-expo) both" }}
      >
        {/* Glow behind modal */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-40"
          style={{
            background: "conic-gradient(from 180deg, transparent 60%, rgba(95,20,251,0.15) 75%, rgba(236,77,203,0.15) 85%, transparent 100%)",
          }}
        />

        {/* Inner Core */}
        <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          {/* Top glow accent */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, rgba(236,77,203,0.5) 0%, transparent 70%)" }}
          />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="relative mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-accent-purple/15 to-accent-pink/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-[22px] font-medium tracking-[-0.4px] text-text-primary">
              Dernière étape
            </h2>
            <p className="mt-2 text-[14px] font-extralight leading-relaxed text-text-secondary">
              Renseignez votre email professionnel pour recevoir votre audit de{" "}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 font-normal text-text-primary">
                <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                {url}
              </span>
            </p>
          </div>

          {/* Separator */}
          <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
            <div>
              <label htmlFor="pro-email" className="mb-2 block text-[13px] font-medium uppercase tracking-[0.5px] text-text-secondary">
                Email professionnel
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  id="pro-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="vous@votreentreprise.com"
                  autoFocus
                  className={`w-full rounded-xl border bg-input-bg py-3.5 pl-11 pr-4 text-[15px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 ${
                    error
                      ? "border-red-400/50 shadow-[0_0_0_1px_rgba(248,113,113,0.15)]"
                      : "border-white/[0.06] focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                />
              </div>
              <div
                className="overflow-hidden transition-all duration-200"
                style={{
                  maxHeight: error ? "40px" : "0",
                  opacity: error ? 1 : 0,
                  transitionTimingFunction: "var(--ease-out)",
                }}
              >
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-red-400">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  {error}
                </p>
              </div>
            </div>

            <Button variant="primary" type="submit" fullWidth>
              Lancer l&apos;audit
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Button>

            <p className="text-center text-[11px] font-extralight tracking-wide text-text-muted">
              Nous ne partagerons jamais votre email.
            </p>
          </form>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
