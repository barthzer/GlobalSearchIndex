"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ModalPortal from "./ModalPortal";
import Button from "./Button";
import OtpInput from "./OtpInput";
import { useAccount } from "./AccountProvider";
import { getLeadByEmail, ensureDemoLead, DEMO_LEAD_EMAIL, type OnboardingLead } from "@/lib/lead";
import { validateProEmail } from "@/lib/proEmail";

interface LoginModalProps {
  onClose: () => void;
}

const inputClass =
  "h-12 w-full rounded-xl border bg-input-bg px-4 text-[14px] font-light text-text-primary placeholder:text-text-input outline-none transition-colors duration-200";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30; // secondes
// TODO(backend): le code est généré et vérifié côté serveur (envoi via ESP transactionnel).
// En mock, on accepte ce code de démo. À supprimer au branchement de l'API.
const DEMO_CODE = "000000";

export default function LoginModal({ onClose }: LoginModalProps) {
  const { accounts, login, loginWith } = useAccount();
  const router = useRouter();
  const [view, setView] = useState<"client" | "admin" | "verify">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ─── Étape de vérification par code (OTP) ───
  const [pendingLead, setPendingLead] = useState<OnboardingLead | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [resent, setResent] = useState(false);

  // Mock dev : seede une analyse de démo pour pouvoir tester la connexion.
  // TODO(backend): à retirer.
  useEffect(() => {
    ensureDemoLead();
  }, []);

  // Compte à rebours du renvoi.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  function goToDashboard() {
    onClose();
    router.push("/dashboard");
  }

  // Particulier : l'analyse est rattachée à l'email. S'il correspond, on envoie un code.
  function handleClientLogin(e: React.FormEvent) {
    e.preventDefault();
    const fmtError = validateProEmail(email);
    if (fmtError) {
      setError(fmtError);
      return;
    }
    const lead = getLeadByEmail(email);
    if (!lead) {
      setError("Aucune analyse trouvée pour cet email.");
      return;
    }
    // TODO(backend): POST /auth/send-code { email } → l'API génère et envoie le code.
    setPendingLead(lead);
    setCode("");
    setCodeError("");
    setVerified(false);
    setResendIn(RESEND_COOLDOWN);
    setView("verify");
  }

  function verifyCode() {
    if (code.length !== CODE_LENGTH || verifying) return;
    setVerifying(true);
    setCodeError("");
    // TODO(backend): POST /auth/verify-code { email, code } → 200 si valide.
    setTimeout(() => {
      if (code === DEMO_CODE) {
        setVerified(true);
        const lead = pendingLead;
        setTimeout(() => {
          if (lead) {
            loginWith({
              type: "user",
              name: `${lead.firstName} ${lead.lastName}`.trim() || lead.company || "Mon compte",
              email: lead.email,
            });
          }
          goToDashboard();
        }, 650);
      } else {
        setVerifying(false);
        setCode("");
        setCodeError("Code incorrect ou expiré. Vérifiez votre saisie ou renvoyez un code.");
      }
    }, 700);
  }

  function resendCode() {
    if (resendIn > 0) return;
    // TODO(backend): POST /auth/send-code { email } → renvoi d'un nouveau code.
    setCode("");
    setCodeError("");
    setResendIn(RESEND_COOLDOWN);
    setResent(true);
    setTimeout(() => setResent(false), 2500);
  }

  function backToEmail() {
    setView("client");
    setCode("");
    setCodeError("");
    setVerifying(false);
    setVerified(false);
  }

  // Admin : vrai compte (email + mot de passe). Mock = email admin connu + mot de passe non vide.
  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    const admin = accounts.find(
      (a) => a.type === "admin" && a.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!admin) {
      setError("Identifiants administrateur invalides.");
      return;
    }
    if (!password.trim()) {
      setError("Veuillez entrer votre mot de passe.");
      return;
    }
    // TODO(backend): vérifier le mot de passe côté serveur. En mock, l'email admin suffit.
    login("admin");
    goToDashboard();
  }

  function switchView(next: "client" | "admin") {
    setView(next);
    setError("");
    setPassword("");
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
          className="relative w-full max-w-[400px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2"
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
              aria-label="Fermer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {view === "verify" ? (
              <>
                {/* Header */}
                <div className="relative mb-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                    <svg className="h-5 w-5 text-[#EE56CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <h2 className="text-[22px] font-medium tracking-[-0.4px] text-text-primary">Vérifiez votre email</h2>
                  <p className="mt-2 text-[14px] font-extralight leading-relaxed text-text-secondary">
                    Saisissez le code à {CODE_LENGTH} chiffres envoyé à
                  </p>
                  <button
                    type="button"
                    onClick={backToEmail}
                    className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-text-primary transition-colors duration-200 hover:text-accent-pink"
                  >
                    {email}
                    <svg className="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                    </svg>
                  </button>
                </div>

                <OtpInput
                  length={CODE_LENGTH}
                  value={code}
                  onChange={(v) => { setCode(v); if (codeError) setCodeError(""); }}
                  error={!!codeError}
                  disabled={verifying || verified}
                />

                {codeError && (
                  <p className="mt-3 text-center text-[12px] font-light leading-relaxed text-red-400">{codeError}</p>
                )}

                {/* TODO(backend): retirer cet indice — le vrai code arrive par email. */}
                <p className="mt-3 text-center text-[11px] font-light text-text-muted/70">
                  Mode démo : saisissez le code {DEMO_CODE}
                </p>

                {/* Renvoi avec compte à rebours */}
                <div className="mt-4 text-center text-[13px]">
                  {resent ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Nouveau code envoyé
                    </span>
                  ) : resendIn > 0 ? (
                    <span className="font-light text-text-muted">Renvoyer un code dans {resendIn}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={resendCode}
                      className="font-medium text-text-secondary transition-colors duration-200 hover:text-accent-pink"
                    >
                      Vous n&apos;avez pas reçu de code ? Renvoyer
                    </button>
                  )}
                </div>

                <div className="mt-5">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={verifyCode}
                    disabled={code.length !== CODE_LENGTH || verifying || verified}
                  >
                    {verified ? (
                      <>
                        Vérifié
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </>
                    ) : verifying ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Vérification…
                      </>
                    ) : (
                      <>
                        Continuer
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </Button>
                </div>

                <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                <p className="text-center text-[12px] font-light leading-relaxed text-text-muted">
                  En continuant, vous acceptez notre{" "}
                  <Link href="/confidentialite" className="text-text-secondary underline underline-offset-2 transition-colors hover:text-text-primary">politique de confidentialité</Link>{" "}
                  et nos{" "}
                  <Link href="/conditions" className="text-text-secondary underline underline-offset-2 transition-colors hover:text-text-primary">conditions d&apos;utilisation</Link>.
                </p>
              </>
            ) : view === "client" ? (
              <>
                {/* Header */}
                <div className="relative mb-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                    <svg className="h-5 w-5 text-[#EE56CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <h2 className="text-[22px] font-medium tracking-[-0.4px] text-text-primary">Connexion</h2>
                  <p className="mt-2 text-[14px] font-extralight leading-relaxed text-text-secondary">
                    Entrez l&apos;email de votre analyse pour y accéder.
                  </p>
                </div>

                <form onSubmit={handleClientLogin} className="flex flex-col gap-3">
                  <div>
                    <input
                      type="email"
                      autoFocus
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                      placeholder="vous@entreprise.com"
                      className={`${inputClass} ${error ? "border-red-400/60" : "border-border-subtle focus:border-accent-pink/40"}`}
                    />
                    {error && <p className="mt-1.5 text-[12px] font-light text-red-400">{error}</p>}
                    {/* TODO(backend): retirer cet indice de test. */}
                    {!error && (
                      <button
                        type="button"
                        onClick={() => { setEmail(DEMO_LEAD_EMAIL); setError(""); }}
                        className="mt-1.5 text-[11px] font-light text-text-muted/70 transition-colors hover:text-accent-pink"
                      >
                        Test : {DEMO_LEAD_EMAIL} (cliquer pour pré-remplir)
                      </button>
                    )}
                  </div>
                  <Button variant="primary" fullWidth type="submit">
                    Accéder à mon analyse
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>
                </form>

                <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                <button
                  type="button"
                  onClick={() => switchView("admin")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-card-inner-bg py-3 text-[13px] font-medium text-text-secondary transition-all duration-200 hover:border-border-badge hover:text-text-primary active:scale-[0.98]"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  Connexion administrateur
                </button>
              </>
            ) : (
              <>
                {/* Header admin */}
                <div className="relative mb-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                    <svg className="h-5 w-5 text-[#EE56CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  </div>
                  <h2 className="text-[22px] font-medium tracking-[-0.4px] text-text-primary">Connexion administrateur</h2>
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
                  <Button variant="primary" fullWidth type="submit">
                    Se connecter
                  </Button>
                  <button
                    type="button"
                    onClick={() => switchView("client")}
                    className="mt-0.5 text-[13px] font-light text-text-muted transition-colors duration-200 hover:text-text-primary"
                  >
                    Retour
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
