"use client";

import { useState } from "react";
import ModalPortal from "./ModalPortal";
import Button from "./Button";
import { useCredits } from "./CreditProvider";

/**
 * Modale affichée quand le client a déjà consommé son analyse gratuite et tente d'en
 * relancer une depuis la landing. On le redirige vers SON analyse déjà effectuée
 * (connexion → dashboard). L'étape de confirmation d'email est conservée mais NON
 * bloquante côté front (démo) : la vraie vérification se fera au backend (code/lien email).
 */
interface Props {
  onAccessAnalysis: () => void;
  onTalkToConsultant: () => void;
  onClose: () => void;
}

export default function ConsultantUpsellModal({ onAccessAnalysis, onTalkToConsultant, onClose }: Props) {
  const { resetDate } = useCredits();
  const [step, setStep] = useState<"choice" | "verify">("choice");
  const [email, setEmail] = useState("");

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    // Non bloquant en démo : on donne accès quel que soit l'email saisi.
    // TODO(backend) : envoyer un code/lien de vérification et ne valider qu'au retour.
    onAccessAnalysis();
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
          className="relative w-full max-w-[420px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2"
          style={{ animation: "fade-up 400ms var(--ease-expo) both" }}
        >
          <div
            className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-40"
            style={{
              background:
                "conic-gradient(from 180deg, transparent 60%, rgba(95,20,251,0.15) 75%, rgba(236,77,203,0.15) 85%, transparent 100%)",
            }}
          />

          <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(236,77,203,0.5) 0%, transparent 70%)" }}
            />

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

            {step === "choice" ? (
              <>
                {/* Icône */}
                <div className="mb-5 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                    <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                  </div>
                  <h2 className="mb-1.5 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                    Vous avez déjà utilisé votre analyse gratuite
                  </h2>
                  <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                    Connectez-vous pour retrouver votre analyse. Votre prochaine analyse gratuite sera
                    disponible le <span className="font-normal text-text-primary">{resetDate}</span>.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Button variant="primary" fullWidth onClick={() => setStep("verify")}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                    </svg>
                    Accéder à mon analyse
                  </Button>
                  <Button variant="tertiary" fullWidth onClick={onTalkToConsultant}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg>
                    Parler à un consultant
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Vérification d'email */}
                <div className="mb-5 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                    <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <h2 className="mb-1.5 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                    Confirmez votre email
                  </h2>
                  <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                    Saisissez l&apos;email professionnel utilisé pour lancer cette analyse.
                  </p>
                </div>

                <form onSubmit={handleVerify} className="flex flex-col gap-2.5">
                  <input
                    type="email"
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@entreprise.com"
                    className="h-12 w-full rounded-xl border border-border-subtle bg-input-bg px-4 text-[14px] font-light text-text-primary placeholder:text-text-input outline-none transition-colors duration-200 focus:border-accent-pink/40"
                  />
                  <Button variant="primary" fullWidth type="submit">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                    </svg>
                    Accéder à mon analyse
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep("choice")}
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
