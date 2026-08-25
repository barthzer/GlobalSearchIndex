"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { useAccount } from "./AccountProvider";
import { sendReportIssue } from "@/lib/api";

const CONTACT_EMAIL = "contact@l-agenceweb.com";

/**
 * Signalement d'erreur / retour utilisateur.
 * Bouton chat flottant (bas droite) qui ouvre une modale centrée. L'envoi est RÉEL
 * (POST /public/report-issue → email vers CONTACT_EMAIL) : la confirmation ne s'affiche
 * QUE si l'envoi a réussi (règle GSI : jamais de faux « envoyé »). En cas d'échec, un
 * message d'erreur invite à réessayer.
 */
export default function ReportIssueWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { account } = useAccount();

  useEffect(() => setMounted(true), []);

  function close() {
    setOpen(false);
    setSent(false);
    setSending(false);
    setError(false);
    setMessage("");
  }

  // Verrouille le scroll + Escape quand la modale est ouverte.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSend() {
    if (!message.trim() || sending) return;
    setSending(true);
    setError(false);
    // Envoi RÉEL awaité : { message, page courante, email du compte si connecté }.
    const ok = await sendReportIssue({
      message: message.trim(),
      page: window.location.href,
      email: account?.email,
    });
    setSending(false);
    // Confirmation UNIQUEMENT sur succès ; sinon on affiche une erreur (réessai possible).
    if (ok) setSent(true);
    else setError(true);
  }

  return (
    <>
      {/* Bouton chat flottant */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Envoyer un retour ou signaler un bug"
        className="fixed bottom-5 right-5 z-[90] flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-modal-bg text-text-primary shadow-[0_8px_24px_-8px_rgba(14,4,27,0.3)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(14,4,27,0.4)] active:scale-[0.95]"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
      </button>

      {/* Modale centrée */}
      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
              onClick={close}
              style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
            />

            <div
              className="relative w-full max-w-[520px] rounded-[2rem] border border-border-subtle bg-modal-bg p-8 shadow-[0_24px_64px_-16px_rgba(14,4,27,0.35)]"
              style={{ animation: "fade-up 400ms var(--ease-expo) both" }}
            >
              {/* Close */}
              <button
                onClick={close}
                aria-label="Fermer"
                className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>

              {sent ? (
                /* Confirmation : même pattern que la modale expert. Affichée UNIQUEMENT sur succès. */
                <div className="flex flex-col items-center py-8 text-center" style={{ animation: "fade-up 400ms var(--ease-expo) both" }}>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6817F8]/20 to-[#EE56CE]/20">
                    <svg className="h-7 w-7 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-text-primary">Message envoyé</h2>
                  <p className="mb-6 max-w-xs text-sm font-extralight leading-relaxed text-text-secondary">
                    Merci pour votre retour. Notre équipe le lira rapidement et corrigera le
                    problème si besoin.
                  </p>
                  <Button variant="tertiary" onClick={close}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Fermer
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-center text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                    Envoyer un retour ou signaler un bug
                  </h2>

                  <p className="mt-4 text-[14px] font-light leading-relaxed text-text-secondary">
                    Dites-nous comment améliorer GSI. Si vous nous signalez un bug, précisez la page
                    concernée et ce que vous tentiez de faire, cela nous aide à corriger plus vite.
                  </p>

                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (error) setError(false);
                    }}
                    placeholder="Ex. : le bouton d'analyse ne répond pas sur la page d'accueil, ou une idée de fonctionnalité..."
                    rows={7}
                    autoFocus
                    disabled={sending}
                    className="mt-4 w-full resize-none rounded-xl border border-white/[0.06] bg-input-bg px-4 py-3 text-[14px] text-text-primary outline-none transition-all duration-300 placeholder:text-text-muted focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)] disabled:opacity-60"
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />

                  {error && (
                    <p className="mt-2 text-[13px] font-light text-red-400">
                      L&apos;envoi a échoué. Vérifiez votre connexion et réessayez.
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[13px] font-light text-text-muted">
                      Vous pouvez aussi nous écrire à{" "}
                      <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-text-secondary hover:text-text-primary">
                        {CONTACT_EMAIL}
                      </a>
                    </p>
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || sending}
                      className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-white px-5 py-2.5 text-sm font-medium text-[#0e041b] shadow-[0_4px_16px_-6px_rgba(14,4,27,0.25)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_-6px_rgba(14,4,27,0.3)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    >
                      {sending ? "Envoi…" : "Envoyer"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
