"use client";

import { useState, useEffect, useRef } from "react";
import Button from "./Button";
import CompanyLogo from "./CompanyLogo";
import ModalPortal from "./ModalPortal";
import DateField from "./DateField";
import { useGeneration } from "./GenerationProvider";

interface WebtvModalProps {
  onClose: () => void;
}

// Proposition IA (mock — à brancher sur le moteur de génération éditoriale). La date de
// tournage reste à l'utilisateur, on ne la génère pas.
const AI_WEBTV: { field: string; value: string }[] = [
  { field: "sujet", value: "Mode éco-responsable & savoir-faire français" },
  { field: "homepage", value: "https://maisonkleber.fr" },
  { field: "titreArticle", value: "5 pièces en lin incontournables pour un dressing durable" },
  { field: "ancre1", value: "robe en lin écoresponsable" },
  { field: "lien1", value: "https://maisonkleber.fr/collections/robes-lin" },
  { field: "ancre2", value: "mode made in France" },
  { field: "lien2", value: "https://maisonkleber.fr/notre-engagement" },
  { field: "ancreOption", value: "blouse en coton bio" },
  { field: "recoSeo", value: "Optimiser les balises title des pages collection et renforcer le maillage interne vers les pages piliers « lin » et « coton bio »." },
  { field: "commentaires", value: "Mettre en avant l'origine France des matières et l'engagement éco-responsable de la marque." },
];

function defaultForm() {
  return {
    date: "", sujet: "", homepage: "", titreArticle: "",
    ancre1: "", lien1: "", ancre2: "", lien2: "",
    ancreOption: "", recoSeo: "", commentaires: "",
  };
}

export default function WebtvModal({ onClose }: WebtvModalProps) {
  const { selected: currentGeneration } = useGeneration();
  const storageKey = `webtv-${currentGeneration.id}`;

  const [form, setForm] = useState(() => {
    if (typeof window === "undefined") return defaultForm();
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultForm();
    } catch { return defaultForm(); }
  });
  const [saved, setSaved] = useState(false);

  // Génération IA : champs en cours de "recherche" (pulsation d'opacité).
  const [aiBusy, setAiBusy] = useState(false);
  const [loadingFields, setLoadingFields] = useState<string[]>([]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const s = localStorage.getItem(storageKey);
      if (s) setForm(JSON.parse(s));
    } catch {}
  }, [storageKey]);

  function update(field: string, value: string) {
    setForm((prev: Record<string, string>) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  /** Pré-remplit le formulaire champ par champ, comme une génération IA en direct. */
  function generateWithAi() {
    if (aiBusy) return;
    setAiBusy(true);
    setSaved(false);
    const keys = AI_WEBTV.map((f) => f.field);
    setLoadingFields(keys);
    setForm((prev: Record<string, string>) => {
      const next = { ...prev };
      keys.forEach((k) => { next[k] = ""; });
      return next;
    });
    AI_WEBTV.forEach(({ field, value }, i) => {
      setTimeout(() => {
        if (!mounted.current) return;
        setForm((prev: Record<string, string>) => ({ ...prev, [field]: value }));
        setLoadingFields((prev) => prev.filter((k) => k !== field));
        if (i === AI_WEBTV.length - 1) setAiBusy(false);
      }, 450 + i * 320);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(storageKey, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        className="relative w-full max-w-[560px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2"
        style={{ animation: "fade-up 400ms var(--ease-expo) both" }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-30"
          style={{
            background: "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)",
          }}
        />

        <div className="relative max-h-[85vh] overflow-y-auto rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="mb-6 mr-10">
                <div className="flex items-center gap-2">
                  <CompanyLogo name={currentGeneration.name} initial={currentGeneration.initial} />
                  <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-card-inner-bg px-3 py-1.5">
                    <svg className="h-4 w-4 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    <span className="text-[length:var(--text-body)] font-medium text-text-heading">
                      WebTV
                    </span>
                  </div>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-text-primary">
                  Recommandations WebTV
                </h2>
              </div>

              <button
                type="button"
                onClick={generateWithAi}
                disabled={aiBusy}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-accent-pink/30 bg-accent-pink/[0.08] py-2.5 text-[13px] font-medium text-accent-pink transition-all duration-200 hover:bg-accent-pink/[0.14] active:scale-[0.98] disabled:cursor-default disabled:opacity-70"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <svg className={`h-4 w-4 ${aiBusy ? "animate-pulse" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                {aiBusy ? "Rédaction par l'IA…" : "Générer avec l'IA"}
              </button>

              <div className="flex flex-col gap-4">
                {/* Date + Sujet */}
                <div className="grid grid-cols-2 gap-3">
                  <DateField label="Date de tournage" value={form.date} onChange={(v) => update("date", v)} required />
                  <Field label="Sujet" value={form.sujet} onChange={(v) => update("sujet", v)} placeholder="Sujet du tournage" required loading={loadingFields.includes("sujet")} />
                </div>

                {/* Homepage */}
                <Field label="Lien de la homepage" value={form.homepage} onChange={(v) => update("homepage", v)} placeholder="https://..." required loading={loadingFields.includes("homepage")} />

                {/* Titre article */}
                <Field label="Titre d'article" value={form.titreArticle} onChange={(v) => update("titreArticle", v)} placeholder="Titre de l'article" required loading={loadingFields.includes("titreArticle")} />

                {/* Ancre 1 + Lien 1 */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ancre 1" value={form.ancre1} onChange={(v) => update("ancre1", v)} placeholder="Texte de l'ancre" required loading={loadingFields.includes("ancre1")} />
                  <Field label="Lien 1" value={form.lien1} onChange={(v) => update("lien1", v)} placeholder="https://..." required loading={loadingFields.includes("lien1")} />
                </div>

                {/* Ancre 2 + Lien 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ancre 2" value={form.ancre2} onChange={(v) => update("ancre2", v)} placeholder="Texte de l'ancre" required loading={loadingFields.includes("ancre2")} />
                  <Field label="Lien 2" value={form.lien2} onChange={(v) => update("lien2", v)} placeholder="https://..." required loading={loadingFields.includes("lien2")} />
                </div>

                {/* Option Ancre */}
                <Field label="Option Ancre" value={form.ancreOption} onChange={(v) => update("ancreOption", v)} placeholder="Ancre supplémentaire" loading={loadingFields.includes("ancreOption")} />

                {/* Reco SEO */}
                <Field label="Recommandations SEO" value={form.recoSeo} onChange={(v) => update("recoSeo", v)} placeholder="Recommandations..." textarea loading={loadingFields.includes("recoSeo")} />

                {/* Commentaires */}
                <Field label="Commentaires" value={form.commentaires} onChange={(v) => update("commentaires", v)} placeholder="Commentaires..." textarea loading={loadingFields.includes("commentaires")} />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button variant="primary" fullWidth type="submit">
                  {saved ? "Sauvegardé" : "Sauvegarder"}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d={saved ? "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" : "M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"} />
                  </svg>
                </Button>
              </div>
            </form>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required, textarea, loading }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  loading?: boolean;
}) {
  const cls = `w-full rounded-xl border bg-card-inner-bg px-4 py-2.5 text-[length:var(--text-body)] font-light text-text-primary outline-none transition-all duration-200 placeholder:text-text-muted ${
    loading
      ? "ai-field-loading"
      : "border-border-subtle focus:border-accent-pink/50 focus:bg-accent-pink/5"
  }`;
  const ph = loading ? "Recherche en cours…" : placeholder;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {label}
        {required && <span className="ml-0.5 text-accent-pink">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ph}
          readOnly={loading}
          rows={3}
          className={`${cls} resize-none`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ph}
          readOnly={loading}
          required={required}
          className={cls}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        />
      )}
    </div>
  );
}
