"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ModalPortal from "./ModalPortal";
import Button from "./Button";

const CODE_LENGTH = 6;
const CODE_TTL = 10 * 60; // 10 minutes, en secondes

const STEPS = [
  "Analyse des balises et du maillage technique...",
  "Clustering sémantique par intention de recherche...",
  "Scan de visibilité sur les LLM...",
  "Évaluation du profil de backlinks...",
];

interface AnalysisVerificationProps {
  url: string;
  email: string;
  /** Analyse terminée → redirection dashboard. */
  onComplete: () => void;
  /** Abandon de la vérification → retour à la landing. */
  onClose: () => void;
}

/**
 * Écran de vérification par code email, en split screen.
 * Gauche : saisie du code à 6 chiffres (renvoi + expiration 10 min).
 * Droite : l'animation d'analyse, d'abord « en attente de validation »,
 * puis lancée dès que le code est validé.
 */
export default function AnalysisVerification({ url, email, onComplete, onClose }: AnalysisVerificationProps) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [confirmResend, setConfirmResend] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(CODE_TTL);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nettoie le timer de vérification si le composant est démonté en cours.
  useEffect(() => () => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
  }, []);

  const complete = digits.every((d) => d !== "");
  const expired = secondsLeft <= 0;

  // Focus le premier champ à l'ouverture.
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Compte à rebours d'expiration (figé une fois le code validé).
  useEffect(() => {
    if (verified || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [verified, secondsLeft]);

  // Animation d'analyse — ne démarre qu'après validation du code.
  useEffect(() => {
    if (!verified) return;
    const duration = 7000;
    const interval = 20;
    const inc = 100 / (duration / interval);
    let cur = 0;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= 100) {
        cur = 100;
        clearInterval(timer);
        setTimeout(onComplete, 300);
      }
      setProgress(cur);
      setActiveStep(Math.min(Math.floor(cur / 25), STEPS.length - 1));
    }, interval);
    return () => clearInterval(timer);
  }, [verified, onComplete]);

  function setDigit(i: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    setError("");
    if (!clean) {
      setDigits((prev) => prev.map((d, idx) => (idx === i ? "" : d)));
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      let idx = i;
      for (const c of clean.split("")) {
        if (idx >= CODE_LENGTH) break;
        next[idx] = c;
        idx++;
      }
      inputsRef.current[Math.min(idx, CODE_LENGTH - 1)]?.focus();
      return next;
    });
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  }

  const validate = useCallback(() => {
    if (!complete || checking) return;
    if (expired) {
      setError("Ce code a expiré. Renvoyez-en un nouveau.");
      return;
    }
    // Mock : toute combinaison de 6 chiffres est acceptée (pas de backend email).
    // TODO(backend): POST { email, code } → vérifier et gérer le code invalide.
    setError("");
    // Courte vérification avant d'afficher la validation (ressenti « on vérifie »).
    setChecking(true);
    checkTimer.current = setTimeout(() => {
      setChecking(false);
      setVerified(true);
    }, 1300);
  }, [complete, checking, expired]);

  // Renvoi effectif du code (après confirmation, pour éviter les missclick).
  function resend() {
    setConfirmResend(false);
    setDigits(Array(CODE_LENGTH).fill(""));
    setSecondsLeft(CODE_TTL);
    setError("");
    inputsRef.current[0]?.focus();
    // TODO(backend): POST { email } → renvoi d'un nouveau code.
  }

  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const s = (secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 grid grid-cols-1 bg-white md:grid-cols-2">
        {/* ───────── Gauche : saisie du code (fond blanc) ───────── */}
        <div className="relative flex items-center justify-center bg-white px-6 py-12 md:px-10">
          {!verified && (
            <button
              onClick={onClose}
              className="absolute left-5 top-5 flex items-center gap-1.5 text-[13px] text-text-muted transition-colors duration-200 hover:text-text-primary"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Retour
            </button>
          )}

          <div className="w-full max-w-[380px]">
            {!verified && !checking ? (
              <>
                <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-pink/10 text-accent-pink">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <h2 className="text-[22px] font-medium tracking-[-0.4px] text-text-primary">Vérifiez votre email</h2>
                <p className="mt-2 text-[14px] font-light leading-relaxed text-text-secondary">
                  Saisissez le code à 6 chiffres envoyé à{" "}
                  <span className="font-medium text-text-primary">{email}</span>.
                </p>

                {/* Emplacements du code */}
                <div className="mt-6 flex items-center justify-between gap-2">
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputsRef.current[i] = el;
                      }}
                      value={d}
                      onChange={(e) => setDigit(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      inputMode="numeric"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      maxLength={CODE_LENGTH}
                      aria-label={`Chiffre ${i + 1}`}
                      className={`h-14 w-full min-w-0 rounded-xl border bg-input-bg text-center text-[20px] font-semibold text-text-primary outline-none transition-all duration-200 ${
                        error
                          ? "border-red-400/60"
                          : "border-border-subtle focus:border-accent-pink/50 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.25)]"
                      }`}
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    />
                  ))}
                </div>

                {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}

                {/* Timer d'expiration */}
                <div className="mt-4 flex items-center gap-2 text-[13px]">
                  {expired ? (
                    <span className="font-medium text-red-400">Code expiré</span>
                  ) : (
                    <span className="flex items-center gap-2 text-text-muted">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      Code valable encore{" "}
                      <span className="font-medium tabular-nums text-text-secondary">{mmss}</span>
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <Button variant="primary" fullWidth onClick={validate} disabled={!complete || checking}>
                    Valider le code
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>
                </div>

                <button
                  onClick={() => setConfirmResend(true)}
                  className="mt-4 w-full text-center text-[13px] text-text-secondary transition-colors duration-200 hover:text-accent-pink"
                >
                  Vous n&apos;avez rien reçu ? <span className="font-medium">Renvoyer un code</span>
                </button>
              </>
            ) : checking ? (
              <div style={{ animation: "fade-up 300ms var(--ease-expo) both" }}>
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-pink/10">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 animate-spin" style={{ animationDuration: "0.8s" }}>
                    <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(236,77,203,0.18)" strokeWidth="2.5" />
                    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="var(--accent-pink)" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
                <h2 className="text-[22px] font-medium tracking-[-0.4px] text-text-primary">Vérification du code…</h2>
                <p className="mt-2 text-[14px] font-light leading-relaxed text-text-secondary">
                  Un instant, nous validons le code saisi.
                </p>
              </div>
            ) : (
              <div style={{ animation: "fade-up 400ms var(--ease-expo) both" }}>
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                <h2 className="text-[22px] font-medium tracking-[-0.4px] text-text-primary">Code valide, analyse en cours</h2>
                <p className="mt-2 text-[14px] font-light leading-relaxed text-text-secondary">
                  Votre bilan de visibilité se prépare. Il s&apos;affiche dans un instant.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ───────── Droite : animation d'analyse (fond primary) ───────── */}
        <div className="relative hidden items-center justify-center overflow-hidden bg-bg-primary md:flex">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-20"
            style={{ background: "radial-gradient(circle, rgba(95,20,251,0.30) 0%, transparent 60%)" }}
          />
          <div
            className="relative flex w-full max-w-sm flex-col items-center px-10"
            style={{ animation: "fade-up 500ms var(--ease-expo) both" }}
          >
            {/* Anneau */}
            <div className={`relative mb-9 h-20 w-20 transition-opacity duration-300 ${verified ? "" : "opacity-70"}`}>
              <svg viewBox="0 0 80 80" className="h-20 w-20 animate-spin" style={{ animationDuration: verified ? "2.5s" : "5s" }}>
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(120,120,140,0.12)" strokeWidth="3" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke="url(#av-loader-grad)" strokeWidth="3"
                  strokeLinecap="round" strokeDasharray="214" strokeDashoffset="160"
                />
                <defs>
                  <linearGradient id="av-loader-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#5f14fb" />
                    <stop offset="100%" stopColor="#ec4dcb" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {verified ? (
                  <span className="text-lg font-bold tabular-nums text-text-primary">{Math.round(progress)}</span>
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-pink animate-pulse" />
                )}
              </div>
            </div>

            {/* URL analysée */}
            <p className="mb-6 max-w-full truncate rounded-full border border-border-subtle bg-white px-5 py-2.5 text-center text-sm text-text-secondary">
              {url}
            </p>

            {/* Bandeau d'état en attente */}
            {!verified && (
              <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-[13px] font-medium text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                En attente de validation
              </p>
            )}

            {/* Étapes */}
            <div className="flex w-full flex-col gap-3">
              {STEPS.map((step, i) => {
                const isActive = verified && i === activeStep;
                const isDone = verified && i < activeStep;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 transition-all duration-300"
                    style={{
                      opacity: !verified ? 0.25 : isDone ? 0.4 : isActive ? 1 : 0.2,
                      transform: isActive ? "translateX(4px)" : "none",
                      transitionTimingFunction: "var(--ease-out)",
                    }}
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {isDone ? (
                        <svg className="h-4 w-4 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : isActive ? (
                        <div className="h-2 w-2 rounded-full bg-accent-purple animate-pulse" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-text-muted" />
                      )}
                    </div>
                    <span className="text-sm text-text-secondary">{step}</span>
                  </div>
                );
              })}
            </div>

            {/* Barre de progression */}
            <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-purple via-accent-pink to-accent-pink-light"
                style={{ width: `${verified ? progress : 0}%`, transition: "width 60ms linear" }}
              />
            </div>
          </div>
        </div>

        {/* Confirmation avant renvoi (anti-missclick) */}
        {confirmResend && (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setConfirmResend(false)}
              style={{ animation: "fade-up 200ms var(--ease-expo) both" }}
            />
            <div
              className="relative w-full max-w-[380px] rounded-3xl border border-border-subtle bg-white p-7 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]"
              style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
            >
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-pink/10 text-accent-pink">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </span>
              <h3 className="text-[19px] font-medium tracking-[-0.3px] text-text-primary">Renvoyer un nouveau code ?</h3>
              <p className="mt-2 text-[14px] font-light leading-relaxed text-text-secondary">
                Un nouveau code sera envoyé à <span className="font-medium text-text-primary">{email}</span>. Le code actuel ne sera plus valable.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirmResend(false)}
                  className="flex-1 rounded-full border border-border-subtle bg-white px-4 py-2.5 text-[14px] font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
                >
                  Annuler
                </button>
                <Button variant="primary" className="flex-1" onClick={resend}>
                  Renvoyer le code
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalPortal>
  );
}
