"use client";

import { useState } from "react";
import ModalPortal from "./ModalPortal";
import Button from "./Button";
import { validateProEmail } from "@/lib/proEmail";
import { getLeadByEmail } from "@/lib/lead";
import type { OnboardingLead, CompanySize, AgencyAnswer } from "@/lib/lead";

/** Normalise une URL pour comparaison souple (protocole, www, casse, slash final). */
function normalizeUrl(u: string) {
  return u
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

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

// Objectifs business (pas de jargon technique) : un dirigeant raisonne en résultats,
// c'est le GSI qui traduit ensuite en leviers (SEO, GEO, trafic…).
const GOALS: { key: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "visibilite-clients",
    label: "Être visible auprès de mes clients",
    icon: (
      <>
        <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </>
    ),
  },
  {
    key: "generer-demandes",
    label: "Générer plus de demandes business",
    icon: <path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />,
  },
  {
    key: "devancer-concurrents",
    label: "Devancer mes concurrents",
    icon: <path d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />,
  },
  {
    key: "notoriete",
    label: "Renforcer ma notoriété",
    icon: <path d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />,
  },
  {
    key: "visibilite-ia",
    label: "Exister dans les réponses IA",
    icon: <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />,
  },
  {
    key: "developper-activite",
    label: "Développer mon activité en ligne",
    icon: <path d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />,
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
    if (emailErr) {
      errs.email = emailErr;
    } else {
      // Email déjà utilisé pour une analyse d'une AUTRE URL → une seule analyse offerte par adresse.
      const existing = getLeadByEmail(form.email);
      if (existing && normalizeUrl(existing.url) !== normalizeUrl(url)) {
        errs.email = `Cette adresse a déjà lancé une analyse pour ${existing.url}. Une seule analyse offerte par email.`;
      }
    }
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
                    <FieldLabel>Quels sont les objectifs de votre entreprise ?</FieldLabel>
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
