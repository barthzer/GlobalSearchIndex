"use client";

import ModalPortal from "./ModalPortal";


import { useState } from "react";
import Button from "./Button";

interface SemanticUnlockModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function SemanticUnlockModal({ onClose, onSubmit }: SemanticUnlockModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [competitors, setCompetitors] = useState(["", "", ""]);
  const [keywords, setKeywords] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");

  function updateCompetitor(i: number, value: string) {
    setCompetitors((prev) => prev.map((v, idx) => (idx === i ? value : v)));
    if (error) setError("");
  }

  function updateKeyword(i: number, value: string) {
    setKeywords((prev) => prev.map((v, idx) => (idx === i ? value : v)));
    if (error) setError("");
  }

  function handleStep1() {
    const filled = competitors.filter((c) => c.trim());
    if (filled.length < 1) {
      setError("Ajoutez au moins 1 concurrent.");
      return;
    }
    setError("");
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    const filled = keywords.filter((k) => k.trim());
    if (filled.length < 3) {
      setError("Ajoutez au moins 3 mots-clés.");
      return;
    }
    onSubmit();
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
              style={{ background: step === 1 ? "var(--accent-pink)" : "rgba(236,77,203,0.45)" }}
            />
            <div
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: step === 2 ? "var(--accent-pink)" : "var(--step-future)" }}
            />
          </div>

          {step === 1 ? (
            /* Step 1: Competitors */
            <div className="relative">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                </div>
                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                  Vos concurrents
                </h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Renseignez jusqu&apos;à 3 sites concurrents pour comparer votre positionnement sémantique.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {competitors.map((val, i) => (
                  <input
                    key={i}
                    type="text"
                    value={val}
                    onChange={(e) => updateCompetitor(i, e.target.value)}
                    placeholder={`https://concurrent${i + 1}.com`}
                    autoFocus={i === 0}
                    className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 ${
                      error ? "border-red-400/50" : "border-white/[0.06] focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
                    }`}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                ))}
              </div>

              {error && (
                <p className="mt-3 flex items-center gap-1.5 text-[12px] text-red-400">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  {error}
                </p>
              )}

              <div className="mt-6">
                <Button variant="primary" fullWidth onClick={handleStep1}>
                  Continuer
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Keywords */
            <div className="relative" style={{ animation: "fade-up 300ms var(--ease-expo) both" }}>
              <button
                onClick={() => { setStep(1); setError(""); }}
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
                    <path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                    <path d="M6 6h.008v.008H6V6Z" />
                  </svg>
                </div>
                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                  Vos mots-clés cibles
                </h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Ajoutez entre 3 et 5 mots-clés sur lesquels vous souhaitez vous positionner.
                </p>
              </div>

              <form onSubmit={handleStep2} className="flex flex-col gap-3">
                {keywords.map((val, i) => (
                  <input
                    key={i}
                    type="text"
                    value={val}
                    onChange={(e) => updateKeyword(i, e.target.value)}
                    placeholder={`Mot-clé ${i + 1}${i >= 3 ? " (optionnel)" : ""}`}
                    autoFocus={i === 0}
                    className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 ${
                      error ? "border-red-400/50" : "border-white/[0.06] focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
                    }`}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                ))}

                {error && (
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-red-400">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {error}
                  </p>
                )}

                <div className="mt-3">
                  <Button variant="primary" type="submit" fullWidth>
                    Débloquer mon score
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
