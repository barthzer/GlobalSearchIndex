"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import AccountAvatar from "./AccountAvatar";
import { useAccount } from "./AccountProvider";
import { useLightSurface } from "./LightSurfaceContext";

interface AccountSettingsModalProps {
  onClose: () => void;
}

/** Découpe un nom complet legacy ("Jean Dupont") en prénom / nom (fallback si champs absents). */
function splitName(name?: string): { first: string; last: string } {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

export default function AccountSettingsModal({ onClose }: AccountSettingsModalProps) {
  const { account, updateAccount } = useAccount();
  const lightSurface = useLightSurface();
  const fallback = splitName(account?.name);
  const [firstName, setFirstName] = useState(account?.firstName ?? fallback.first);
  const [lastName, setLastName] = useState(account?.lastName ?? fallback.last);
  const [company, setCompany] = useState(account?.company ?? "");
  const [phone, setPhone] = useState(account?.phone ?? "");
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Modifier un champ réinitialise le feedback + efface son erreur.
  function edit<T>(setter: (v: T) => void, key?: keyof typeof errors) {
    return (v: T) => {
      setter(v);
      setSaved(false);
      if (key && errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    };
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!firstName.trim()) errs.firstName = "Requis";
    if (!lastName.trim()) errs.lastName = "Requis";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    // Email volontairement non modifiable (identité du compte + garde-fou 1 analyse/email).
    updateAccount({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim(),
      phone: phone.trim(),
      name,
    });
    setSaved(true);
  }

  if (!mounted || !account) return null;

  const accFirst = account.firstName ?? fallback.first;
  const accLast = account.lastName ?? fallback.last;
  const dirty =
    firstName.trim() !== accFirst ||
    lastName.trim() !== accLast ||
    company.trim() !== (account.company ?? "") ||
    phone.trim() !== (account.phone ?? "");
  const displayName = `${firstName} ${lastName}`.trim() || account.name;

  return createPortal(
    <div data-theme={lightSurface ? "light" : undefined} className="fixed inset-0 z-[100] flex items-center justify-center px-4">
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

          <div className="relative">
            {/* En-tête : avatar + identité */}
            <div className="mb-6 flex flex-col items-center text-center">
              <AccountAvatar name={displayName} avatar={account.avatar} size={56} className="mb-3" />
              <h2 className="text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                Paramètres du compte
              </h2>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-card-inner-bg px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-pink" />
                {account.type === "admin" ? "Compte administrateur AWI" : "Compte gratuit"}
              </span>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom" id="acc-first" value={firstName} error={errors.firstName} placeholder="Jean" onChange={edit(setFirstName, "firstName")} />
                <Field label="Nom" id="acc-last" value={lastName} error={errors.lastName} placeholder="Dupont" onChange={edit(setLastName, "lastName")} />
              </div>
              <Field label="Entreprise" id="acc-company" value={company} placeholder="Nom de votre entreprise" optional onChange={edit(setCompany)} />
              <Field
                label="Email professionnel"
                id="acc-email"
                type="email"
                value={account.email}
                placeholder=""
                locked
                hint="Rattaché à votre analyse. Pour le modifier, contactez-nous."
                onChange={() => {}}
              />
              <Field label="Téléphone" id="acc-phone" type="tel" value={phone} placeholder="+33 6 12 34 56 78" optional onChange={edit(setPhone)} />

              <div className="mt-2">
                <Button type="submit" variant="primary" fullWidth disabled={!dirty && !saved}>
                  {saved && !dirty ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Modifications enregistrées
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </form>

            <p className="mt-5 text-center text-[11px] font-extralight tracking-wide text-text-muted">
              Vos informations sont stockées localement sur cet appareil.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Field({
  label,
  id,
  value,
  error,
  placeholder,
  type = "text",
  optional = false,
  locked = false,
  hint,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  error?: string;
  placeholder: string;
  type?: string;
  optional?: boolean;
  locked?: boolean;
  hint?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-text-secondary">
        {label}
        {optional && <span className="text-[11px] font-extralight text-text-muted">Optionnel</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={locked}
          className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-[14px] outline-none transition-all duration-300 ${
            locked
              ? "cursor-not-allowed border-white/[0.06] pr-10 text-text-muted"
              : error
                ? "border-red-400/50 text-text-primary placeholder:text-text-muted"
                : "border-white/[0.06] text-text-primary placeholder:text-text-muted focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
          }`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        />
        {locked && (
          <svg className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        )}
      </div>
      {error && <p className="mt-1 text-[12px] text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1 text-[11px] font-light text-text-muted">{hint}</p>}
    </div>
  );
}
