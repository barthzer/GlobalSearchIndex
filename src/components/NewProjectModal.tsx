"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModalPortal from "./ModalPortal";
import { apiFetch } from "@/lib/api";
import { useGeneration } from "./GenerationProvider";

// Formulaire INTERNE de création (commercial → projet prospect). PAS le funnel
// public (URL + email/lead). Reprend les champs + l'enchaînement d'apps/web
// (vérité terrain), avec le design de la maquette.
function isValidUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const inputClass =
  "w-full rounded-xl border border-white/[0.06] bg-input-bg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-colors duration-200 focus:border-accent-pink/40";

export default function NewProjectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { refresh, setSelectedId } = useGeneration();

  const [domain, setDomain] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Redirection cross-host détectée : on demande au commercial quel domaine
  // analyser — jamais de bascule silencieuse (retour Kevin van-it.com→.fr).
  const [redirectPrompt, setRedirectPrompt] = useState<{
    input: string;
    final: string;
  } | null>(null);

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Format invalide. PNG ou JPG uniquement.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Fichier trop volumineux. 2 Mo maximum.");
      return;
    }
    setError(null);
    setLogoFile(file);
    const r = new FileReader();
    r.onload = (ev) => setLogoPreview(ev.target?.result as string);
    r.readAsDataURL(file);
  }

  // Création effective. resolvedDomain = host final verbatim quand on analyse la
  // cible d'une redirection ; sinon le domaine saisi.
  async function doCreate(resolvedDomain?: string) {
    setRedirectPrompt(null);
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, string> = { domain };
      if (resolvedDomain) body.resolvedDomain = resolvedDomain;
      if (companyName.trim()) body.companyName = companyName.trim();
      if (description.trim()) body.description = description.trim();

      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(j.message || "Erreur lors de la création du projet");
      }
      const project = (await res.json()) as { id: string };

      if (logoFile) {
        const fd = new FormData();
        fd.append("file", logoFile);
        await apiFetch(`/projects/${project.id}/logo`, { method: "POST", body: fd });
      }

      // ② État d'attente : la liste se rafraîchit, le nouveau projet apparaît
      //    avec son statut « en cours » (les scores se déclenchent).
      await refresh();
      setSelectedId(project.id);
      onClose();
      router.push("/dashboard");
    } catch (e) {
      // ③ Erreur explicite, jamais un silence.
      setError(e instanceof Error ? e.message : "Erreur lors de la création du projet");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidUrl(domain)) {
      setDomainError("URL invalide (ex: https://example.com)");
      return;
    }
    setDomainError(null);
    setSubmitting(true);
    setError(null);
    try {
      // Check redirect AVANT création. Fail-open : si le check échoue, on crée
      // quand même sur le domaine saisi (jamais bloquer la création).
      const res = await apiFetch("/projects/check-domain", {
        method: "POST",
        body: JSON.stringify({ domain }),
      });
      const check = res.ok
        ? ((await res.json()) as {
            kind: string;
            inputDomain: string;
            finalDomain: string;
          })
        : null;
      if (check?.kind === "cross_host") {
        // ① Redirection cross-host → confirmation, pas de bascule auto.
        setSubmitting(false);
        setRedirectPrompt({ input: check.inputDomain, final: check.finalDomain });
        return;
      }
      // apex→www : bascule silencieuse (même host). none/error : domaine saisi.
      await doCreate(check?.kind === "apex_www" ? check.finalDomain : undefined);
    } catch {
      await doCreate();
    }
  }

  const formValid = domain.length > 0 && isValidUrl(domain) && !domainError;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
          onClick={onClose}
        />
        {/* ① Confirmation redirection cross-host */}
        {redirectPrompt ? (
          <div className="relative w-full max-w-md rounded-[2rem] border border-white/[0.06] bg-input-bg p-6">
            <h3 className="mb-2 text-base font-medium text-text-primary">
              Ce domaine redirige ailleurs
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-text-secondary">
              <span className="font-medium text-text-primary">
                {redirectPrompt.input}
              </span>{" "}
              redirige vers{" "}
              <span className="font-medium text-text-primary">
                {redirectPrompt.final}
              </span>
              . Quel domaine analyser ? Le rapport portera sur le domaine choisi.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => doCreate(redirectPrompt.final)}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-accent-purple to-accent-pink px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
              >
                Analyser {redirectPrompt.final}
              </button>
              <button
                type="button"
                onClick={() => doCreate()}
                className="inline-flex items-center justify-center rounded-full border border-white/[0.06] px-5 py-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                Non, garder {redirectPrompt.input}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-[460px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-6 md:p-7">
            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:text-text-primary active:scale-[0.95]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="mb-1 text-[22px] font-medium tracking-[-0.4px] text-text-primary">
              Nouvelle analyse
            </h2>
            <p className="mb-5 text-[13px] font-light text-text-secondary">
              Entrez les informations du site à analyser.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* URL */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                  URL du site <span className="text-accent-pink">*</span>
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    setDomainError(null);
                  }}
                  placeholder="https://example.com"
                  className={inputClass}
                />
                {domainError && (
                  <p className="mt-1 text-[12px] text-red-400">{domainError}</p>
                )}
              </div>

              {/* Entreprise */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                  Nom de l&apos;entreprise{" "}
                  <span className="text-[11px] font-light text-text-muted">Optionnel</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Example SAS"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                  Description{" "}
                  <span className="text-[11px] font-light text-text-muted">Optionnel</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du projet..."
                  maxLength={500}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-1 text-right text-[11px] text-text-muted">
                  {description.length}/500
                </p>
              </div>

              {/* Logo */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                  Logo{" "}
                  <span className="text-[11px] font-light text-text-muted">Optionnel</span>
                </label>
                {logoPreview ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview}
                      alt="Aperçu logo"
                      className="h-16 w-16 rounded-xl border border-white/[0.06] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/[0.08] p-5 text-sm text-text-secondary transition-colors hover:border-accent-pink/30 hover:text-text-primary">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    PNG ou JPG, max 2 Mo
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleLogo}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* ③ Erreur explicite */}
              {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-400/[0.06] px-4 py-2.5 text-[13px] text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!formValid || submitting}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5f14fb] via-accent-pink to-[#f987e0] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Création en cours…
                  </>
                ) : (
                  <>
                    Analyser
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </ModalPortal>
  );
}
