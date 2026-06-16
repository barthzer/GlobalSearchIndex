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

// Propositions IA (mock — à brancher sur le moteur de génération éditoriale).
const AI_TITLES = [
  "5 pièces en lin incontournables pour un dressing durable",
  "Mode éco-responsable : le savoir-faire français qui change tout",
  "Lin & coton bio : construire une garde-robe vraiment responsable",
];
const AI_KEYWORDS = [
  "robe en lin écoresponsable",
  "mode made in France",
  "blouse en coton bio",
  "vêtements durables femme",
  "garde-robe éco-responsable",
];

const AI_EMAIL =
  "Bonjour,\n\nVoici les recommandations pour le tournage WebTV. Nous mettrons en avant votre collection en lin et l'engagement éco-responsable de la marque, avec un maillage interne vers vos pages piliers (lin, coton bio).\n\nTitre d'article proposé : « 5 pièces en lin incontournables pour un dressing durable ».\n\nN'hésitez pas à revenir vers nous pour caler la date de tournage.\n\nBien à vous,\nL'équipe AWI";

interface WebtvForm {
  dateTournage: string;
  dateMediatisation: string;
  dateDiffusion: string;
  homepage: string;
  titre: string;
  ancre1: string;
  lien1: string;
  ancre2: string;
  lien2: string;
  ancreOption: string;
  recoSeo: string;
  commentaires: string;
  email: string;
}

function defaultForm(url = ""): WebtvForm {
  return {
    dateTournage: "", dateMediatisation: "", dateDiffusion: "",
    homepage: url ? `https://${url.replace(/^https?:\/\//, "")}` : "",
    titre: "", ancre1: "", lien1: "", ancre2: "", lien2: "",
    ancreOption: "", recoSeo: "", commentaires: "", email: "",
  };
}

export default function WebtvModal({ onClose }: WebtvModalProps) {
  const { selected: currentGeneration } = useGeneration();
  const storageKey = `webtv-${currentGeneration.id}`;

  const [form, setForm] = useState<WebtvForm>(() => {
    if (typeof window === "undefined") return defaultForm(currentGeneration.url);
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? { ...defaultForm(currentGeneration.url), ...JSON.parse(saved) } : defaultForm(currentGeneration.url);
    } catch { return defaultForm(currentGeneration.url); }
  });
  const [tab, setTab] = useState<"infos" | "email">("infos");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Propositions IA (transitoires, non persistées).
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [titleBusy, setTitleBusy] = useState(false);
  const [kwBusy, setKwBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  function update<K extends keyof WebtvForm>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function generateTitles() {
    if (titleBusy) return;
    setSaved(false);
    setTitleBusy(true);
    setTitleSuggestions([]);
    AI_TITLES.forEach((t, i) => {
      setTimeout(() => {
        if (!mounted.current) return;
        setTitleSuggestions((prev) => [...prev, t]);
        if (i === AI_TITLES.length - 1) setTitleBusy(false);
      }, 400 + i * 320);
    });
  }

  function generateKeywords() {
    if (kwBusy) return;
    setSaved(false);
    setKwBusy(true);
    setKeywordSuggestions([]);
    AI_KEYWORDS.forEach((k, i) => {
      setTimeout(() => {
        if (!mounted.current) return;
        setKeywordSuggestions((prev) => [...prev, k]);
        if (i === AI_KEYWORDS.length - 1) setKwBusy(false);
      }, 400 + i * 280);
    });
  }

  function generateEmail() {
    if (emailBusy) return;
    setSaved(false);
    setEmailBusy(true);
    update("email", "");
    setTimeout(() => {
      if (!mounted.current) return;
      setForm((prev) => ({ ...prev, email: AI_EMAIL }));
      setEmailBusy(false);
    }, 900);
  }

  function handleSave() {
    localStorage.setItem(storageKey, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => { if (mounted.current) setSaved(false); }, 2000);
  }

  async function copyEmail() {
    if (!form.email) return;
    try {
      await navigator.clipboard.writeText(form.email);
      setCopied(true);
      setTimeout(() => { if (mounted.current) setCopied(false); }, 1800);
    } catch { /* clipboard indisponible */ }
  }

  function aiButton(onClick: () => void, label: string, busy: boolean) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent-pink/30 bg-accent-pink/[0.08] py-2.5 text-[13px] font-medium text-accent-pink transition-all duration-200 hover:bg-accent-pink/[0.14] active:scale-[0.98] disabled:cursor-default disabled:opacity-70"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <svg className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
        {busy ? "Rédaction par l'IA…" : label}
      </button>
    );
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
            style={{ background: "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)" }}
          />

          <div className="relative flex max-h-[88vh] flex-col rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
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

            {/* Header + tabs (fixe) */}
            <div className="shrink-0 px-8 pt-8">
              <div className="mb-4 mr-10">
                <div className="flex items-center gap-2">
                  <CompanyLogo name={currentGeneration.name} initial={currentGeneration.initial} />
                  <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-card-inner-bg px-3 py-1.5">
                    <svg className="h-4 w-4 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    <span className="text-[length:var(--text-body)] font-medium text-text-heading">WebTV</span>
                  </div>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-text-primary">
                  Recommandations WebTV
                </h2>
              </div>

              {/* Onglets */}
              <div className="flex gap-1 rounded-full border border-border-subtle bg-card-inner-bg p-1">
                {([["infos", "Informations"], ["email", "Email"]] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`flex-1 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                      tab === key ? "bg-bg-card text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"
                    }`}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu (scrollable) */}
            <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
              {tab === "infos" ? (
                <div className="flex flex-col gap-5">
                  {/* Dates */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DateField label="Date de tournage" value={form.dateTournage} onChange={(v) => update("dateTournage", v)} />
                    <DateField label="Date de diffusion" value={form.dateDiffusion} onChange={(v) => update("dateDiffusion", v)} align="right" />
                  </div>

                  {/* Lien homepage */}
                  <Field label="Lien de la homepage (URL du site)" value={form.homepage} onChange={(v) => update("homepage", v)} placeholder="https://..." />

                  {/* Titre — 3 propositions IA */}
                  <div className="flex flex-col gap-2">
                    <SectionLabel>Titre d&apos;article</SectionLabel>
                    {aiButton(generateTitles, "Générer 3 titres avec l'IA", titleBusy)}
                    {titleSuggestions.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        {titleSuggestions.map((t, i) => {
                          const selected = form.titre === t;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => update("titre", t)}
                              className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[13px] transition-all duration-150 ${
                                selected
                                  ? "border-accent-pink bg-accent-pink/10 text-text-primary"
                                  : "border-border-subtle bg-card-inner-bg text-text-secondary hover:border-accent-pink/40 hover:text-text-primary"
                              }`}
                              style={{ transitionTimingFunction: "var(--ease-out)", animation: "fade-up 300ms var(--ease-out) both" }}
                            >
                              <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-accent-pink bg-accent-pink" : "border-border-badge"}`}>
                                {selected && (
                                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                )}
                              </span>
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <Field label="" value={form.titre} onChange={(v) => update("titre", v)} placeholder="Titre retenu (modifiable)" />
                  </div>

                  {/* Mots-clés — 5 propositions IA → 2 ancres */}
                  <div className="flex flex-col gap-2">
                    <SectionLabel>Ancres &amp; liens</SectionLabel>
                    {aiButton(generateKeywords, "Générer 5 mots-clés avec l'IA", kwBusy)}

                    <AnchorRow
                      n={1}
                      keywords={keywordSuggestions}
                      anchor={form.ancre1}
                      link={form.lien1}
                      onAnchor={(v) => update("ancre1", v)}
                      onLink={(v) => update("lien1", v)}
                    />
                    <AnchorRow
                      n={2}
                      keywords={keywordSuggestions}
                      anchor={form.ancre2}
                      link={form.lien2}
                      onAnchor={(v) => update("ancre2", v)}
                      onLink={(v) => update("lien2", v)}
                    />
                  </div>

                  {/* Champs manuels */}
                  <Field label="Option ancre" value={form.ancreOption} onChange={(v) => update("ancreOption", v)} placeholder="Ancre supplémentaire (optionnel)" />
                  <Field label="Recommandation SEO" value={form.recoSeo} onChange={(v) => update("recoSeo", v)} placeholder="Recommandations SEO..." textarea />
                  <Field label="Commentaires" value={form.commentaires} onChange={(v) => update("commentaires", v)} placeholder="Commentaires..." textarea />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {aiButton(generateEmail, "Générer l'email avec l'IA", emailBusy)}
                  <div className="flex flex-col gap-1.5">
                    <SectionLabel>Email au client</SectionLabel>
                    <div className="relative">
                      <textarea
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        readOnly={emailBusy}
                        placeholder={emailBusy ? "Rédaction en cours…" : "Brouillon de l'email au client..."}
                        rows={13}
                        className={`w-full resize-none rounded-xl border bg-card-inner-bg px-4 py-3 pr-12 text-[length:var(--text-body)] font-light leading-relaxed text-text-primary outline-none transition-all duration-200 placeholder:text-text-muted ${
                          emailBusy ? "ai-field-loading" : "border-border-subtle focus:border-accent-pink/50 focus:bg-accent-pink/5"
                        }`}
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      />
                      <button
                        type="button"
                        onClick={copyEmail}
                        title={copied ? "Copié" : "Copier l'email"}
                        aria-label="Copier l'email"
                        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-modal-bg text-text-muted transition-all duration-200 hover:border-accent-pink/40 hover:text-text-primary active:scale-95"
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      >
                        {copied ? (
                          <svg className="h-4 w-4 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m11.25 6.75h-1.875a1.125 1.125 0 0 1-1.125-1.125v-1.875" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer — Enregistrer (toujours dispo) */}
            <div className="shrink-0 border-t border-border-subtle px-8 py-5">
              <Button variant="primary" fullWidth onClick={handleSave}>
                {saved ? "Enregistré" : "Enregistrer"}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d={saved ? "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" : "M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"} />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{children}</label>;
}

/** Bloc d'ancre : choix d'un mot-clé généré (chips) + ancre éditable + lien. */
function AnchorRow({
  n, keywords, anchor, link, onAnchor, onLink,
}: {
  n: number;
  keywords: string[];
  anchor: string;
  link: string;
  onAnchor: (v: string) => void;
  onLink: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-card-inner-bg/40 p-3">
      <p className="mb-2 text-[12px] font-medium text-text-secondary">Ancre n°{n}</p>
      {keywords.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {keywords.map((kw, i) => {
            const active = anchor === kw;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onAnchor(kw)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
                  active
                    ? "border-accent-pink bg-accent-pink/15 text-accent-pink"
                    : "border-border-badge bg-bg-card text-text-secondary hover:border-accent-pink/40 hover:text-text-primary"
                }`}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                {kw}
              </button>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Field label="" value={anchor} onChange={onAnchor} placeholder={`Ancre n°${n}`} compact />
        <Field label="" value={link} onChange={onLink} placeholder="https://..." compact />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", textarea, compact }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  compact?: boolean;
}) {
  const cls = `w-full rounded-xl border border-border-subtle bg-card-inner-bg px-4 ${compact ? "py-2" : "py-2.5"} text-[length:var(--text-body)] font-light text-text-primary outline-none transition-all duration-200 placeholder:text-text-muted focus:border-accent-pink/50 focus:bg-accent-pink/5`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <SectionLabel>{label}</SectionLabel>}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${cls} resize-none`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        />
      )}
    </div>
  );
}
