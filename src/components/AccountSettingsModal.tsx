"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import AccountAvatar from "./AccountAvatar";
import { useAccount } from "./AccountProvider";

interface AccountSettingsModalProps {
  onClose: () => void;
}

export default function AccountSettingsModal({ onClose }: AccountSettingsModalProps) {
  const { account, updateAccount } = useAccount();
  const [name, setName] = useState(account?.name ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
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

  // Réinitialise le feedback dès qu'on modifie un champ.
  function onName(v: string) {
    setName(v);
    setSaved(false);
    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
  }
  function onEmail(v: string) {
    setEmail(v);
    setSaved(false);
    if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs: { name?: string; email?: string } = {};
    if (!name.trim()) errs.name = "Requis";
    if (!email.trim()) errs.email = "Requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Email invalide";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    updateAccount({ name: name.trim(), email: email.trim() });
    setSaved(true);
  }

  if (!mounted || !account) return null;

  const dirty = name.trim() !== account.name || email.trim() !== account.email;

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

          <div className="relative">
            {/* En-tête : avatar + identité */}
            <div className="mb-6 flex flex-col items-center text-center">
              <AccountAvatar name={name || account.name} avatar={account.avatar} size={56} className="mb-3" />
              <h2 className="text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                Paramètres du compte
              </h2>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-card-inner-bg px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-pink" />
                {account.type === "admin" ? "Compte administrateur AWI" : "Compte gratuit"}
              </span>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Field
                label="Nom"
                id="acc-name"
                value={name}
                error={errors.name}
                placeholder="Jean Dupont"
                onChange={onName}
              />
              <Field
                label="Email"
                id="acc-email"
                type="email"
                value={email}
                error={errors.email}
                placeholder="vous@entreprise.com"
                onChange={onEmail}
              />

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
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  error?: string;
  placeholder: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-input-bg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 ${
          error
            ? "border-red-400/50"
            : "border-white/[0.06] focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      />
      {error && <p className="mt-1 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
