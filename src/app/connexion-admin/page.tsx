"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useAccount } from "@/components/AccountProvider";

/**
 * Page de connexion administrateur dédiée (hors modale de connexion client).
 * Volontairement non liée depuis l'UI publique : on y accède par l'URL directe
 * pour ne pas perturber les utilisateurs. Accès réservé à l'équipe AWI.
 */

const inputClass =
  "h-12 w-full rounded-xl border bg-input-bg px-4 text-[14px] font-light text-text-primary placeholder:text-text-input outline-none transition-colors duration-200";

export default function AdminLoginPage() {
  const { loginWithCredentials } = useAccount();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Renseignez votre email et votre mot de passe.");
      return;
    }
    // Connexion RÉELLE (POST /auth/login) : le serveur vérifie le mot de passe et
    // émet les JWT. Le rôle admin vient de la BDD (toAccount), jamais du client.
    setSubmitting(true);
    try {
      await loginWithCredentials(email.trim(), password);
      router.push("/dashboard");
    } catch {
      setError("Identifiants administrateur invalides.");
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
                <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <h1 className="text-[22px] font-medium tracking-[-0.4px] text-text-primary">Connexion administrateur</h1>
            <p className="mt-2 text-[14px] font-extralight leading-relaxed text-text-secondary">
              Accès réservé à l&apos;équipe AWI.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-3">
            <input
              type="email"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
              placeholder="Email"
              className={`${inputClass} ${error ? "border-red-400/60" : "border-border-subtle focus:border-accent-pink/40"}`}
            />
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                placeholder="Mot de passe"
                className={`${inputClass} ${error ? "border-red-400/60" : "border-border-subtle focus:border-accent-pink/40"}`}
              />
              {error && <p className="mt-1.5 text-[12px] font-light text-red-400">{error}</p>}
            </div>
            <Button variant="primary" fullWidth type="submit" disabled={submitting}>
              {submitting ? "Connexion…" : "Se connecter"}
            </Button>
          </form>

          <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <Link
            href="/"
            className="block text-center text-[13px] font-light text-text-muted transition-colors duration-200 hover:text-text-primary"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
