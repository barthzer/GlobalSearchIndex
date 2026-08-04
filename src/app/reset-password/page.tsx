"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { confirmPasswordReset } from "@/lib/api";

/**
 * Réinitialisation du mot de passe depuis le lien reçu par email.
 *
 * Le lien porte un token signé (`?token=…`) : signature + expiry 1h + usage
 * unique vérifiés CÔTÉ SERVEUR (POST /auth/reset-password/confirm via
 * confirmPasswordReset). Le front se contente de collecter le nouveau mot de
 * passe + sa confirmation et d'appeler l'API — aucune logique de validité de
 * token côté client (le serveur fait foi).
 *
 * Le token est lu depuis window.location.search (client-only) : pas de
 * useSearchParams → pas de frontière Suspense requise, compatible export statique.
 */

const inputClass =
  "h-12 w-full rounded-xl border bg-input-bg px-4 text-[14px] font-light text-text-primary placeholder:text-text-input outline-none transition-colors duration-200";

// Aligné sur le DTO serveur (newPassword @MinLength(6)).
const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordPage() {
  // Token lu depuis l'URL via un initialiseur paresseux (une seule lecture au
  // montage, côté client). SSR : pas de window → null, le contenu se stabilise
  // au 1er rendu client sans setState dans un effet (lint Barth).
  const [token] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("token");
  });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !token) return;

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      // Le serveur vérifie le token (signature + expiry 1h + usage unique) et
      // applique le hash. Toute erreur (401 lien mort, 5xx) remonte ici.
      await confirmPasswordReset(token, password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Réinitialisation impossible pour le moment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg-primary px-4">
      <div className="relative w-full max-w-[400px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2">
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

          <div className="relative mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <svg className="h-5 w-5 text-[#EE56CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h1 className="text-[22px] font-medium tracking-[-0.4px] text-text-primary">
              Réinitialiser le mot de passe
            </h1>
            <p className="mt-2 text-[14px] font-extralight leading-relaxed text-text-secondary">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>
          </div>

          {/* État 1 : token absent de l'URL (lien tronqué / accès direct). */}
          {!token ? (
            <div className="relative flex flex-col items-center text-center">
              <p className="text-[14px] font-light leading-relaxed text-red-400">
                Lien invalide : aucun jeton de réinitialisation n&apos;a été trouvé.
                Demandez un nouveau lien.
              </p>
              <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <Link
                href="/login"
                className="text-[13px] font-light text-text-muted transition-colors duration-200 hover:text-text-primary"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : done ? (
            /* État 2 : succès. */
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/[0.08]">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-[14px] font-light leading-relaxed text-text-secondary">
                Votre mot de passe a été mis à jour. Vous pouvez maintenant vous
                connecter avec votre nouveau mot de passe.
              </p>
              <div className="mt-6 w-full">
                <Button variant="primary" fullWidth href="/login">
                  Aller à la connexion
                </Button>
              </div>
            </div>
          ) : (
            /* État 3 : formulaire (token présent). Désactivé tant que le token n'est pas lu. */
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="password"
                autoFocus
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                placeholder="Nouveau mot de passe"
                className={`${inputClass} ${error ? "border-red-400/60" : "border-border-subtle focus:border-accent-pink/40"}`}
              />
              <div>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); if (error) setError(""); }}
                  placeholder="Confirmer le mot de passe"
                  className={`${inputClass} ${error ? "border-red-400/60" : "border-border-subtle focus:border-accent-pink/40"}`}
                />
                {error && <p className="mt-1.5 text-[12px] font-light text-red-400">{error}</p>}
              </div>
              <Button variant="primary" fullWidth type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Enregistrement…
                  </>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </Button>

              <div className="my-2 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <Link
                href="/login"
                className="text-center text-[13px] font-light text-text-muted transition-colors duration-200 hover:text-text-primary"
              >
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
