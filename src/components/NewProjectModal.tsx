"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { apiFetch } from "@/lib/api";
import { useGeneration } from "./GenerationProvider";

interface Props {
  onClose: () => void;
}

/**
 * Création d'un projet (nouvelle analyse) : URL du site à analyser + nom
 * d'entreprise optionnel. POST /projects déclenche côté serveur les scores
 * automatiques ; on rafraîchit la liste (provider) et on sélectionne le nouveau
 * projet avant de fermer, pour que le dashboard bascule dessus immédiatement.
 */
export default function NewProjectModal({ onClose }: Props) {
  const { refresh, setSelectedId } = useGeneration();
  const [mounted, setMounted] = useState(false);
  const [domain, setDomain] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    const value = domain.trim();
    // Validation minimale alignée sur le DTO serveur (domaine >= 3 caractères).
    if (value.length < 3) {
      setError("Saisissez l'URL du site à analyser.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          domain: value,
          ...(companyName.trim() ? { companyName: companyName.trim() } : {}),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const created = (await res.json()) as { id?: string };
      // Liste à jour + bascule sur le nouveau projet (le corps du dashboard le lit).
      await refresh();
      if (created.id) setSelectedId(created.id);
      onClose();
    } catch {
      setError("La création de l'analyse a échoué. Vérifiez l'URL et réessayez.");
      setSubmitting(false);
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
            className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">Nouvelle analyse</h2>
              <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                Saisissez l&apos;URL du site à analyser. Les scores se lancent automatiquement.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="np-domain" className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-text-secondary">
                  URL du site
                </label>
                <input
                  id="np-domain"
                  type="text"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    setError("");
                  }}
                  placeholder="exemple.com"
                  autoFocus
                  className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 ${
                    error
                      ? "border-red-400/50"
                      : "border-white/[0.06] focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                />
                {error && <p className="mt-1 text-[12px] text-red-400">{error}</p>}
              </div>

              <div>
                <label htmlFor="np-company" className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-text-secondary">
                  Nom de l&apos;entreprise
                  <span className="text-[11px] font-extralight text-text-muted">Optionnel</span>
                </label>
                <input
                  id="np-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nom affiché dans la liste"
                  className="w-full rounded-xl border border-white/[0.06] bg-input-bg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                />
              </div>

              <div className="mt-2">
                <Button variant="primary" type="submit" fullWidth disabled={submitting}>
                  {submitting ? "Lancement…" : "Lancer l'analyse"}
                  {!submitting && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
