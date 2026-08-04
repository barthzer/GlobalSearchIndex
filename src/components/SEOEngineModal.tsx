"use client";

import ModalPortal from "./ModalPortal";


import { useState } from "react";
import Button from "./Button";

interface SEOEngineModalProps {
  onClose: () => void;
}

const features = [
  { label: "SEO Technique", desc: "Crawl complet, Core Web Vitals, indexation" },
  { label: "SEO Sémantique", desc: "Clustering de mots-clés, gaps de contenu" },
  { label: "SEA", desc: "Analyse des campagnes, quality score, budget" },
  { label: "GEO", desc: "Visibilité LLM, positionnement multi-modèle" },
];

export default function SEOEngineModal({ onClose }: SEOEngineModalProps) {
  const [step, setStep] = useState<"intro" | "form">("intro");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    website: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Requis";
    if (!form.lastName.trim()) errs.lastName = "Requis";
    if (!form.email.trim()) errs.email = "Requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email invalide";
    if (!form.company.trim()) errs.company = "Requis";
    if (!form.website.trim()) errs.website = "Requis";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
  }

  return (
    <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
        onClick={onClose}
        style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
      />

      {/* Double-Bezel */}
      <div
        className="relative w-full max-w-[540px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2"
        style={{ animation: "fade-up 400ms var(--ease-expo) both" }}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-30"
          style={{
            background: "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)",
          }}
        />

        {/* Inner */}
        <div className="relative max-h-[85vh] overflow-y-auto rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          {/* Top glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(95,20,251,0.5) 0%, transparent 70%)" }}
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

          {submitted ? (
            /* Success */
            <div className="flex flex-col items-center py-8 text-center" style={{ animation: "fade-up 400ms var(--ease-expo) both" }}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6817F8]/20 to-[#EE56CE]/20">
                <svg className="h-7 w-7 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-text-primary">Demande envoyée</h2>
              <p className="mb-6 max-w-xs text-sm font-extralight leading-relaxed text-text-secondary">
                Notre équipe vous contactera sous 24h avec votre rapport complet Global Search Index.
              </p>
              <Button variant="tertiary" onClick={onClose}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Fermer
              </Button>
            </div>
          ) : step === "intro" ? (
            /* Intro */
            <div className="relative">
              <div className="mb-6 flex flex-col items-center text-center">
                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-badge bg-bg-card px-3 py-1">
                  <svg className="h-3 w-3 text-accent-pink" viewBox="0 0 13 13" fill="currentColor">
                    <path d="M6.5 0L8 4.5L13 6.5L8 8.5L6.5 13L5 8.5L0 6.5L5 4.5Z" />
                  </svg>
                  <span className="text-[12px] font-medium text-text-secondary">Nouveau</span>
                </div>

                <h2 className="mb-1 text-[24px] font-medium tracking-[-0.4px] text-text-primary">
                  Global Search Index
                </h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Obtenez un rapport d&apos;audit complet couvrant l&apos;ensemble de votre écosystème digital.
                </p>
              </div>

              {/* Feature grid */}
              <div className="mb-8 grid grid-cols-2 gap-3">
                {features.map((f) => (
                  <div
                    key={f.label}
                    className="rounded-xl border border-border-subtle bg-white/[0.02] p-4"
                  >
                    <div className="mb-1.5 text-[13px] font-medium text-text-primary">{f.label}</div>
                    <div className="text-[12px] font-extralight leading-relaxed text-text-secondary">{f.desc}</div>
                  </div>
                ))}
              </div>

              {/* Separator */}
              <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

              <div className="mb-2 text-center text-[13px] font-extralight text-text-secondary">
                Renseignez vos informations pour recevoir votre rapport personnalisé.
              </div>

              <Button variant="primary" fullWidth onClick={() => setStep("form")}>
                Demander mon audit complet
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </div>
          ) : (
            /* Form */
            <div className="relative" style={{ animation: "fade-up 300ms var(--ease-expo) both" }}>
              <button
                onClick={() => setStep("intro")}
                className="mb-4 flex items-center gap-1.5 text-[13px] text-text-muted transition-colors duration-200 hover:text-text-primary"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Retour
              </button>

              <div className="mb-6 flex flex-col items-center text-center">
                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                  Vos informations
                </h2>
                <p className="text-[13px] font-extralight text-text-secondary">
                  Ces informations nous permettent de personnaliser votre rapport.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Nom / Prénom */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" id="firstName" value={form.firstName} error={errors.firstName} placeholder="Jean" onChange={(v) => update("firstName", v)} />
                  <Field label="Nom" id="lastName" value={form.lastName} error={errors.lastName} placeholder="Dupont" onChange={(v) => update("lastName", v)} />
                </div>

                <Field label="Email professionnel" id="email" type="email" value={form.email} error={errors.email} placeholder="vous@entreprise.com" onChange={(v) => update("email", v)} />
                <Field label="Entreprise" id="company" value={form.company} error={errors.company} placeholder="Nom de votre entreprise" onChange={(v) => update("company", v)} />
                <Field label="Site web" id="website" value={form.website} error={errors.website} placeholder="https://votresite.com" onChange={(v) => update("website", v)} />
                <Field label="Téléphone" id="phone" type="tel" value={form.phone} error={errors.phone} placeholder="+33 6 12 34 56 78" optional onChange={(v) => update("phone", v)} />

                <div className="mt-2">
                  <Button variant="primary" type="submit" fullWidth>
                    Recevoir mon rapport
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>
                </div>

                <p className="text-center text-[11px] font-extralight tracking-wide text-text-muted">
                  Vos données sont sécurisées et ne seront jamais partagées.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
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
      {error && (
        <p className="mt-1 text-[12px] text-red-400">{error}</p>
      )}
    </div>
  );
}
