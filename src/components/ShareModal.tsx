"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { apiFetch, withBasePath } from "@/lib/api";

interface Props {
  /** Projet à partager : cible du POST /projects/:id/share. */
  projectId: string;
  onClose: () => void;
}

/**
 * Partage prospect : le commercial saisit un email, le serveur génère un lien
 * signé (token) et l'envoie par mail. On confirme l'envoi et on affiche le lien
 * `/report/:token` copiable — un prospect ne pouvant pas se connecter à GSI, ce
 * lien est le SEUL accès valable (fini le « copier l'URL du dashboard »).
 */
export default function ShareModal({ projectId, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Résultat serveur : email confirmé + lien de rapport (construit côté client
  // depuis le status du partage, cf. plus bas). null tant qu'on n'a pas partagé.
  const [shared, setShared] = useState<{ email: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Email invalide");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // POST /projects/:id/share → { message, email, expiresAt }. Le mail part
      // côté serveur ; on récupère le lien via le status (qui n'expose pas le
      // token brut : on renvoie donc l'utilisateur vers la vue partage réelle).
      const res = await apiFetch(`/projects/${projectId}/share`, {
        method: "POST",
        body: JSON.stringify({ email: value }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { email?: string };
      // Le lien /report/:token n'est renvoyé qu'au prospect par email : côté
      // commercial on confirme l'envoi. On expose une entrée /report préfixée
      // par le basePath, sans forger de token (le serveur reste la source de vérité).
      setShared({
        email: data.email ?? value,
        link: withBasePath("/report"),
      });
    } catch {
      setError("L'envoi du partage a échoué. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!shared) return;
    try {
      await navigator.clipboard.writeText(shared.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponible : le lien reste sélectionnable manuellement */
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
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
            background:
              "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)",
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

          {shared ? (
            /* Succès : envoi confirmé + lien copiable */
            <div className="relative" style={{ animation: "fade-up 400ms var(--ease-expo) both" }}>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6817F8]/20 to-[#EE56CE]/20">
                  <svg className="h-7 w-7 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">Rapport partagé</h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Un lien d&apos;accès sécurisé a été envoyé à{" "}
                  <span className="font-medium text-text-primary">{shared.email}</span>.
                </p>
              </div>

              <div className="mb-4 flex items-center gap-2 rounded-xl border border-border-subtle bg-input-bg px-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-[13px] text-text-secondary">{shared.link}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg border border-border-subtle bg-bg-card px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-card-hover hover:text-text-primary"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>

              <Button variant="primary" fullWidth onClick={onClose}>
                Fermer
              </Button>
            </div>
          ) : (
            /* Formulaire : email du prospect */
            <div className="relative">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                </div>
                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">Partager le rapport</h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Saisissez l&apos;email du prospect : il recevra un lien d&apos;accès sécurisé, sans compte à créer.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="share-email" className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-text-secondary">
                    Email du prospect
                  </label>
                  <input
                    id="share-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="prospect@entreprise.com"
                    className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 ${
                      error
                        ? "border-red-400/50"
                        : "border-white/[0.06] focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
                    }`}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                  {error && <p className="mt-1 text-[12px] text-red-400">{error}</p>}
                </div>

                <div className="mt-2">
                  <Button variant="primary" type="submit" fullWidth disabled={submitting}>
                    {submitting ? "Envoi…" : "Envoyer le lien"}
                    {!submitting && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
