"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { getClientInfo, saveClientInfo } from "@/lib/clientInfo";

interface Props {
  genId: string;
  genName: string;
  onClose: () => void;
}

export default function ClientInfoModal({ genId, genName, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    const info = getClientInfo(genId);
    setFirstName(info.firstName);
    setLastName(info.lastName);
    setEmail(info.email);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [genId]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email invalide");
      return;
    }
    saveClientInfo(genId, { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
    setSaved(true);
  }

  if (!mounted) return null;

  const dirty = (() => {
    const i = getClientInfo(genId);
    return firstName.trim() !== i.firstName || lastName.trim() !== i.lastName || email.trim() !== i.email;
  })();

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
          style={{ background: "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)" }}
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
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h2 className="text-[20px] font-medium tracking-[-0.4px] text-text-primary">Infos utilisateur</h2>
              <p className="mt-1 text-[13px] font-extralight leading-relaxed text-text-secondary">
                Coordonnées rattachées à l&apos;analyse <span className="font-medium text-text-primary">{genName}</span>.
              </p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom" id="ci-fn" value={firstName} placeholder="Jean" onChange={(v) => { setFirstName(v); setSaved(false); }} />
                <Field label="Nom" id="ci-ln" value={lastName} placeholder="Dupont" onChange={(v) => { setLastName(v); setSaved(false); }} />
              </div>
              <Field label="Email" id="ci-email" type="email" value={email} error={error} placeholder="client@entreprise.com" onChange={(v) => { setEmail(v); setSaved(false); setError(""); }} />

              <div className="mt-2">
                <Button type="submit" variant="primary" fullWidth disabled={!dirty && !saved}>
                  {saved && !dirty ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Enregistré
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </form>
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
          error ? "border-red-400/50" : "border-white/[0.06] focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      />
      {error && <p className="mt-1 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
