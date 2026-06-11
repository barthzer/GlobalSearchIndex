"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { getLatestLead } from "@/lib/lead";

interface ExpertModalProps {
  onClose: () => void;
}

export default function ExpertModal({ onClose }: ExpertModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Préremplissage depuis l'onboarding : on ne redemande pas ce que le lead a déjà saisi.
    const lead = getLatestLead();
    if (lead) {
      setForm((prev) => ({
        ...prev,
        firstName: lead.firstName || prev.firstName,
        lastName: lead.lastName || prev.lastName,
        email: lead.email || prev.email,
        phone: lead.phone || prev.phone,
        company: lead.company || prev.company,
      }));
      // Identité connue → on saute l'étape coordonnées et on va droit au contexte.
      if (lead.firstName && lead.lastName && lead.email && lead.company) {
        setStep(2);
      }
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handleStep1() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Requis";
    if (!form.lastName.trim()) errs.lastName = "Requis";
    if (!form.email.trim()) errs.email = "Requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email invalide";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.company.trim()) errs.company = "Requis";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
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
            background: "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)",
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

          {/* Steps indicator — passé rose faible, actif rose, futur gris */}
          <div className="mb-6 mr-10 flex items-center gap-2">
            <div
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: step === 1 && !submitted ? "var(--accent-pink)" : "rgba(236,77,203,0.45)" }}
            />
            <div
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: step === 2 || submitted ? "var(--accent-pink)" : "var(--step-future)" }}
            />
          </div>

          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center" style={{ animation: "fade-up 400ms var(--ease-expo) both" }}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6817F8]/20 to-[#EE56CE]/20">
                <svg className="h-7 w-7 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-text-primary">Demande envoyée</h2>
              <p className="mb-6 max-w-xs text-sm font-extralight leading-relaxed text-text-secondary">
                Un expert AWI vous contactera dans les plus brefs délais pour discuter de vos résultats.
              </p>
              <Button variant="tertiary" onClick={onClose}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Fermer
              </Button>
            </div>
          ) : step === 1 ? (
            /* Step 1: Identity */
            <div className="relative">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                  Vos coordonnées
                </h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Pour qu&apos;un expert AWI puisse vous recontacter rapidement.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" id="expert-fn" value={form.firstName} error={errors.firstName} placeholder="Jean" onChange={(v) => update("firstName", v)} />
                  <Field label="Nom" id="expert-ln" value={form.lastName} error={errors.lastName} placeholder="Dupont" onChange={(v) => update("lastName", v)} />
                </div>
                <Field label="Email professionnel" id="expert-email" type="email" value={form.email} error={errors.email} placeholder="vous@entreprise.com" onChange={(v) => update("email", v)} />
                <Field label="Téléphone" id="expert-phone" type="tel" value={form.phone} placeholder="+33 6 12 34 56 78" optional onChange={(v) => update("phone", v)} />
              </div>

              <div className="mt-6">
                <Button variant="primary" fullWidth onClick={handleStep1}>
                  Continuer
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Context */
            <div className="relative" style={{ animation: "fade-up 300ms var(--ease-expo) both" }}>
              <button
                onClick={() => { setStep(1); setErrors({}); }}
                className="mb-4 flex items-center gap-1.5 text-[13px] text-text-muted transition-colors duration-200 hover:text-text-primary"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Retour
              </button>

              <div className="mb-6 flex flex-col items-center text-center">
                {/* Avatars */}
                <div className="mb-4 flex -space-x-2">
                  {["/consultant1.png", "/consultant2.png", "/consultant3.png"].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Consultant"
                      className="h-10 w-10 rounded-full border-2 border-modal-bg object-cover"
                    />
                  ))}
                </div>

                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                  Votre projet
                </h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Aidez nos consultants à préparer votre échange.
                </p>
              </div>

              <form onSubmit={handleStep2} className="flex flex-col gap-4">
                <Field label="Entreprise" id="expert-company" value={form.company} error={errors.company} placeholder="Nom de votre entreprise" onChange={(v) => update("company", v)} />

                <div>
                  <label htmlFor="expert-msg" className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-text-secondary">
                    Message
                    <span className="text-[11px] font-extralight text-text-muted">Optionnel</span>
                  </label>
                  <textarea
                    id="expert-msg"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Décrivez brièvement votre besoin..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/[0.06] bg-input-bg px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                </div>

                <div className="mt-2">
                  <Button variant="primary" type="submit" fullWidth>
                    Envoyer ma demande
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </Button>
                </div>

                <p className="text-center text-[11px] font-extralight tracking-wide text-text-muted">
                  Réponse sous 24h ouvrées.
                </p>
              </form>
            </div>
          )}
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
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  error?: string;
  placeholder: string;
  type?: string;
  optional?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-text-secondary">
        {label}
        {optional && <span className="text-[11px] font-extralight text-text-muted">Optionnel</span>}
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
