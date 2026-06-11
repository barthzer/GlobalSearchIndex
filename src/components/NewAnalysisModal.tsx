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

interface NewAnalysisModalProps {
  onClose: () => void;
}

export default function NewAnalysisModal({ onClose }: NewAnalysisModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [urlError, setUrlError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleStep1() {
    if (!url.trim()) {
      setUrlError("Veuillez entrer une URL.");
      return;
    }
    setUrlError("");
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Veuillez entrer votre email professionnel.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Format d'email invalide.");
      return;
    }
    const domain = email.split("@")[1].toLowerCase();
    if (FREE_DOMAINS.includes(domain)) {
      setEmailError("Veuillez utiliser votre adresse email professionnelle.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
        onClick={onClose}
        style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
      />

      <div
        className="relative w-full max-w-[440px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2"
        style={{ animation: "fade-up 400ms var(--ease-expo) both" }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-30"
          style={{
            background: "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)",
          }}
        />

        <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-20"
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

          {/* Steps indicator — passé rose faible, actif rose, futur gris */}
          <div className="mb-6 mr-10 flex items-center gap-2">
            <div
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: step === 1 && !submitted ? "var(--accent-pink)" : "rgba(236,77,203,0.45)" }}
            />
            <div
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: step === 2 || submitted ? "var(--accent-pink)" : "var(--step-future)" }}
            />
          </div>

          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center" style={{ animation: "fade-up 400ms var(--ease-expo) both" }}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6817F8]/20 to-[#EE56CE]/20">
                <svg className="h-7 w-7 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-medium text-text-primary">Analyse lancée</h2>
              <p className="mb-6 max-w-xs text-sm font-extralight leading-relaxed text-text-secondary">
                L&apos;analyse de <span className="font-normal text-text-primary">{url}</span> est en cours. Vous recevrez les résultats sur <span className="font-normal text-text-primary">{email}</span>.
              </p>
              <Button variant="tertiary" onClick={onClose}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Fermer
              </Button>
            </div>
          ) : step === 1 ? (
            /* Step 1: URL */
            <div className="relative">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9 9 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                  Nouvelle analyse
                </h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Entrez l&apos;URL du site à analyser.
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="new-url" className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                  URL du site
                </label>
                <input
                  id="new-url"
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); if (urlError) setUrlError(""); }}
                  placeholder="https://exemple.com"
                  autoFocus
                  className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 ${
                    urlError ? "border-red-400/50" : "border-white/[0.06] focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                />
                {urlError && <p className="mt-2 text-[12px] text-red-400">{urlError}</p>}
              </div>

              <Button variant="primary" fullWidth onClick={handleStep1}>
                Continuer
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Button>
            </div>
          ) : (
            /* Step 2: Email */
            <div className="relative" style={{ animation: "fade-up 300ms var(--ease-expo) both" }}>
              <button
                onClick={() => { setStep(1); setEmailError(""); }}
                className="mb-4 flex items-center gap-1.5 text-[13px] text-text-muted transition-colors duration-200 hover:text-text-primary"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Retour
              </button>

              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                  Email professionnel
                </h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Recevez les résultats de l&apos;analyse de{" "}
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 font-normal text-text-primary">
                    {url}
                  </span>
                </p>
              </div>

              <form onSubmit={handleStep2}>
                <div className="mb-6">
                  <label htmlFor="new-email" className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                    Email professionnel
                  </label>
                  <input
                    id="new-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                    placeholder="vous@entreprise.com"
                    autoFocus
                    className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 ${
                      emailError ? "border-red-400/50" : "border-white/[0.06] focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
                    }`}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                  {emailError && <p className="mt-2 text-[12px] text-red-400">{emailError}</p>}
                </div>

                <Button variant="primary" type="submit" fullWidth>
                  Lancer l&apos;analyse
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Button>
              </form>

              <p className="mt-4 text-center text-[11px] font-extralight tracking-wide text-text-muted">
                Nous ne partagerons jamais votre email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
