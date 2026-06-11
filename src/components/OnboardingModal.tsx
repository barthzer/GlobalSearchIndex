"use client";

import { useState } from "react";
import ModalPortal from "./ModalPortal";
import Button from "./Button";
import { validateProEmail } from "@/lib/proEmail";
import type { OnboardingLead, CompanySize, AgencyAnswer } from "@/lib/lead";

interface OnboardingModalProps {
  url: string;
  onComplete: (lead: OnboardingLead) => void;
  onClose: () => void;
}

const COMPANY_SIZES: { key: CompanySize; label: string }[] = [
  { key: "solo", label: "Solo" },
  { key: "2-10", label: "2-10" },
  { key: "11-50", label: "11-50" },
  { key: "51-200", label: "51-200" },
  { key: "200+", label: "200+" },
];

const GOALS: { key: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "seo-technique",
    label: "SEO technique",
    icon: <path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />,
  },
  {
    key: "geo",
    label: "Visibilité sur les IA",
    icon: <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2Z" />,
  },
  {
    key: "notoriete",
    label: "Notoriété & autorité",
    icon: <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />,
  },
  {
    key: "concurrence",
    label: "Analyse concurrentielle",
    icon: <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />,
  },
  {
    key: "trafic",
    label: "Trafic organique",
    icon: <path d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />,
  },
  {
    key: "semantique",
    label: "Mots-clés & sémantique",
    icon: <path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z M6 6h.008v.008H6V6Z" />,
  },
];

export default function OnboardingModal({ url, onComplete, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    companySize: null as CompanySize | null,
    worksWithAgency: null as AgencyAnswer | null,
    goals: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: "" }));
  }

  function toggleGoal(key: string) {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(key) ? prev.goals.filter((g) => g !== key) : [...prev.goals, key],
    }));
    if (errors.goals) setErrors((prev) => ({ ...prev, goals: "" }));
  }

  function handleStep1() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Requis";
    if (!form.lastName.trim()) errs.lastName = "Requis";
    if (!form.company.trim()) errs.company = "Requis";
    const emailErr = validateProEmail(form.email);
    if (emailErr) errs.email = emailErr;
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
    if (!form.companySize) errs.companySize = "Sélectionnez une taille";
    if (!form.worksWithAgency) errs.worksWithAgency = "Sélectionnez une réponse";
    if (form.goals.length === 0) errs.goals = "Choisissez au moins un objectif";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onComplete({
      ...form,
      url,
      submittedAt: Date.now(),
    });
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
          onClick={onClose}
          style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
        />

        {/* Outer shell */}
        <div
          className="relative max-h-[calc(100dvh-3rem)] w-full max-w-[480px] overflow-y-auto rounded-[2rem] border border-white/[0.06] bg-input-bg p-2"
          style={{ animation: "fade-up 400ms var(--ease-expo) both" }}
        >
          <div
            className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-40"
            style={{
              background:
                "conic-gradient(from 180deg, transparent 60%, rgba(95,20,251,0.15) 75%, rgba(236,77,203,0.15) 85%, transparent 100%)",
            }}
          />

          {/* Inner core */}
          <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] md:p-8">
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(236,77,203,0.5) 0%, transparent 70%)" }}
            />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
              aria-label="Fermer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Stepper — passé rose faible, actif rose, futur gris */}
            <div className="mb-6 mr-10 flex items-center gap-2">
              <div
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{ background: step === 1 ? "var(--accent-pink)" : "rgba(236,77,203,0.45)" }}
              />
              <div
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{ background: step === 2 ? "var(--accent-pink)" : "var(--step-future)" }}
              />
            </div>

            {step === 1 ? (
              <div className="relative">
                <div className="mb-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-accent-purple/15 to-accent-pink/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                    <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                    Avant de lancer votre analyse
                  </h2>
                  <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                    Quelques infos pour personnaliser votre rapport
                    {url ? (
                      <>
                        {" "}de{" "}
                        <span className="font-normal text-text-primary">{url}</span>.
                      </>
                    ) : (
                      "."
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Prénom" id="ob-fn" value={form.firstName} error={errors.firstName} placeholder="Jean" onChange={(v) => update("firstName", v)} />
                    <Field label="Nom" id="ob-ln" value={form.lastName} error={errors.lastName} placeholder="Dupont" onChange={(v) => update("lastName", v)} />
                  </div>
                  <Field label="Entreprise" id="ob-company" value={form.company} error={errors.company} placeholder="Nom de votre entreprise" onChange={(v) => update("company", v)} />
                  <Field label="Email professionnel" id="ob-email" type="email" value={form.email} error={errors.email} placeholder="vous@entreprise.com" onChange={(v) => update("email", v)} />
                  <Field label="Téléphone" id="ob-phone" type="tel" value={form.phone} placeholder="+33 6 12 34 56 78" optional onChange={(v) => update("phone", v)} />
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
                  <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                    Votre contexte
                  </h2>
                  <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                    Pour cibler les recommandations qui comptent pour vous.
                  </p>
                </div>

                <form onSubmit={handleStep2} className="flex flex-col gap-6">
                  {/* Taille entreprise */}
                  <div>
                    <FieldLabel>Taille de votre entreprise</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {COMPANY_SIZES.map(({ key, label }) => {
                        const selected = form.companySize === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => update("companySize", key)}
                            aria-pressed={selected}
                            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 active:scale-[0.97] ${
                              selected
                                ? "border-accent-pink/50 bg-accent-pink/10 text-text-primary"
                                : "border-white/[0.06] bg-input-bg text-text-secondary hover:border-white/10 hover:text-text-primary"
                            }`}
                            style={{ transitionTimingFunction: "var(--ease-out)" }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    {errors.companySize && <p className="mt-1.5 text-[12px] text-red-400">{errors.companySize}</p>}
                  </div>

                  {/* Agence */}
                  <div>
                    <FieldLabel>Travaillez-vous avec une agence ?</FieldLabel>
                    <div className="flex gap-2">
                      {(["oui", "non"] as AgencyAnswer[]).map((ans) => {
                        const selected = form.worksWithAgency === ans;
                        return (
                          <button
                            key={ans}
                            type="button"
                            onClick={() => update("worksWithAgency", ans)}
                            aria-pressed={selected}
                            className={`flex-1 rounded-xl border px-4 py-2.5 text-[14px] font-medium capitalize transition-all duration-200 active:scale-[0.98] ${
                              selected
                                ? "border-accent-pink/50 bg-accent-pink/10 text-text-primary"
                                : "border-white/[0.06] bg-input-bg text-text-secondary hover:border-white/10 hover:text-text-primary"
                            }`}
                            style={{ transitionTimingFunction: "var(--ease-out)" }}
                          >
                            {ans}
                          </button>
                        );
                      })}
                    </div>
                    {errors.worksWithAgency && <p className="mt-1.5 text-[12px] text-red-400">{errors.worksWithAgency}</p>}
                  </div>

                  {/* Objectifs */}
                  <div>
                    <FieldLabel>Que souhaitez-vous améliorer ?</FieldLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {GOALS.map(({ key, label, icon }) => {
                        const selected = form.goals.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleGoal(key)}
                            aria-pressed={selected}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 active:scale-[0.98] ${
                              selected
                                ? "border-accent-pink/50 bg-accent-pink/10"
                                : "border-white/[0.06] bg-input-bg hover:border-white/10"
                            }`}
                            style={{ transitionTimingFunction: "var(--ease-out)" }}
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                                selected ? "bg-accent-pink/15 text-accent-pink" : "bg-white/[0.04] text-text-muted"
                              }`}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                {icon}
                              </svg>
                            </span>
                            <span className={`text-[12.5px] font-medium leading-tight ${selected ? "text-text-primary" : "text-text-secondary"}`}>
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.goals && <p className="mt-1.5 text-[12px] text-red-400">{errors.goals}</p>}
                  </div>

                  <Button variant="primary" type="submit" fullWidth>
                    Lancer mon analyse
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>

                  <p className="-mt-2 text-center text-[11px] font-extralight tracking-wide text-text-muted">
                    Audit gratuit et instantané · Aucune carte requise
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-[13px] font-medium text-text-secondary">{children}</p>;
}

function Field({
  label, id, value, error, placeholder, type = "text", optional = false, onChange,
}: {
  label: string; id: string; value: string; error?: string; placeholder: string;
  type?: string; optional?: boolean; onChange: (v: string) => void;
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
