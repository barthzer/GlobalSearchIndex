"use client";

import ModalPortal from "./ModalPortal";
import { useState, useRef, useEffect } from "react";
import Button from "./Button";

interface SemanticUnlockModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

type Item = { value: string; checked: boolean };

// Candidats proposés par l'IA (mock — à brancher sur le moteur de suggestion).
const AI_COMPETITORS = [
  "sezane.com",
  "balzac-paris.fr",
  "rouje.com",
  "ba-sh.com",
  "soeur.fr",
  "claudiepierlot.com",
];
const AI_KEYWORDS = [
  "robe en lin femme",
  "vêtements éco-responsables",
  "mode made in france",
  "blouse coton bio",
  "jupe midi plissée",
  "robe coton bio",
];

const COMP_MAX = 3;
const COMP_REQ = 3;
const KW_MAX = 5;
const KW_REQ = 3;

const emptyItems = (n: number): Item[] => Array.from({ length: n }, () => ({ value: "", checked: false }));

export default function SemanticUnlockModal({ onClose, onSubmit }: SemanticUnlockModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [competitors, setCompetitors] = useState<Item[]>(() => emptyItems(3));
  const [keywords, setKeywords] = useState<Item[]>(() => emptyItems(5));
  const [error, setError] = useState("");

  const [aiBusy, setAiBusy] = useState<null | "comp" | "kw">(null);
  const [compLoading, setCompLoading] = useState<boolean[]>(() => Array(3).fill(false));
  const [kwLoading, setKwLoading] = useState<boolean[]>(() => Array(5).fill(false));
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const compChecked = competitors.filter((c) => c.checked).length;
  const kwChecked = keywords.filter((k) => k.checked).length;

  /**
   * Révèle les candidats un par un : chaque ligne (y compris les nouvelles, au-delà des
   * lignes déjà présentes) apparaît avec une entrée animée, pulse, puis se remplit.
   */
  function runAiFill(
    candidates: string[],
    setList: React.Dispatch<React.SetStateAction<Item[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean[]>>,
    key: "comp" | "kw",
    required: number,
    baseCount: number,
  ) {
    if (aiBusy) return;
    setError("");
    setAiBusy(key);
    setList(emptyItems(baseCount));
    setLoading(Array(baseCount).fill(false));

    const APPEAR = 150; // cadence d'apparition des lignes (vides)
    const SEARCH_PAUSE = 750; // temps de "recherche" une fois toutes les lignes affichées
    const FILL = 300; // cadence de remplissage

    // Phase 1 — les lignes apparaissent une par une, vides et en train de "chercher" (pulsation).
    candidates.forEach((_, i) => {
      setTimeout(() => {
        if (!mounted.current) return;
        setList((prev) => {
          const next = [...prev];
          while (next.length <= i) next.push({ value: "", checked: false });
          return next;
        });
        setLoading((prev) => {
          const next = [...prev];
          while (next.length <= i) next.push(false);
          next[i] = true;
          return next;
        });
      }, 300 + i * APPEAR);
    });

    // Phase 2 — une fois toutes affichées, elles se remplissent une par une.
    const fillStart = 300 + (candidates.length - 1) * APPEAR + SEARCH_PAUSE;
    candidates.forEach((value, i) => {
      setTimeout(() => {
        if (!mounted.current) return;
        setList((prev) => {
          const checkedSoFar = prev.filter((x) => x.checked).length;
          return prev.map((x, idx) => (idx === i ? { value, checked: checkedSoFar < required } : x));
        });
        setLoading((prev) => prev.map((l, idx) => (idx === i ? false : l)));
        if (i === candidates.length - 1) setAiBusy(null);
      }, fillStart + i * FILL);
    });
  }

  function toggleItem(setList: React.Dispatch<React.SetStateAction<Item[]>>, max: number, i: number) {
    setError("");
    setList((prev) => {
      const item = prev[i];
      if (!item.value.trim()) return prev;
      if (!item.checked && prev.filter((x) => x.checked).length >= max) return prev;
      return prev.map((x, idx) => (idx === i ? { ...x, checked: !x.checked } : x));
    });
  }

  function updateItem(setList: React.Dispatch<React.SetStateAction<Item[]>>, max: number, i: number, value: string) {
    setError("");
    setList((prev) =>
      prev.map((x, idx) => {
        if (idx !== i) return x;
        if (!value.trim()) return { value, checked: false };
        // Saisie manuelle : on coche automatiquement s'il reste de la place.
        if (!x.checked && prev.filter((p) => p.checked).length < max) return { value, checked: true };
        return { ...x, value };
      }),
    );
  }

  function handleStep1() {
    if (compChecked < COMP_REQ) {
      setError(`Sélectionnez ${COMP_REQ} concurrents.`);
      return;
    }
    setError("");
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    if (kwChecked < KW_REQ) {
      setError(`Sélectionnez au moins ${KW_REQ} mots-clés.`);
      return;
    }
    onSubmit();
  }

  function renderRow(
    item: Item,
    i: number,
    loading: boolean,
    checkedCount: number,
    max: number,
    setList: React.Dispatch<React.SetStateAction<Item[]>>,
    placeholder: string,
  ) {
    const atCap = !item.checked && checkedCount >= max;
    const canCheck = !loading && item.value.trim().length > 0 && !atCap;
    return (
      <div key={i} className="relative" style={{ animation: "fade-up 380ms var(--ease-out) both" }}>
        <input
          type="text"
          value={item.value}
          onChange={(e) => updateItem(setList, max, i, e.target.value)}
          readOnly={loading}
          placeholder={loading ? "Recherche en cours…" : placeholder}
          className={`w-full rounded-xl border bg-input-bg py-3 pl-4 pr-12 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 ${
            loading
              ? "ai-field-loading"
              : item.checked
                ? "border-[#2962FF]/60 bg-[#2962FF]/[0.06] shadow-[0_0_0_1px_rgba(41,107,255,0.25)] focus:border-[#2962FF]"
                : "border-white/[0.06] focus:border-accent-pink/40 focus:shadow-[0_0_12px_-4px_rgba(236,77,203,0.15)]"
          }`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        />
        <button
          type="button"
          onClick={() => toggleItem(setList, max, i)}
          disabled={!canCheck && !item.checked}
          aria-pressed={item.checked}
          className={`absolute right-2.5 top-1/2 flex h-[22px] w-[22px] -translate-y-1/2 items-center justify-center rounded-md border transition-all duration-150 ${
            item.checked
              ? "border-[#2962FF] bg-[#2962FF]"
              : `border-border-badge bg-text-primary/[0.08] ${atCap || !item.value.trim() ? "opacity-40" : "hover:border-[#2962FF]/60 hover:bg-text-primary/[0.12]"}`
          }`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          {item.checked && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </button>
      </div>
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

          {/* Steps indicator */}
          <div className="mb-6 mr-10 flex items-center gap-2">
            <div className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: step === 1 ? "var(--accent-pink)" : "rgba(236,77,203,0.45)" }} />
            <div className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: step === 2 ? "var(--accent-pink)" : "var(--step-future)" }} />
          </div>

          {step === 1 ? (
            /* Step 1: Competitors */
            <div className="relative">
              <div className="mb-5 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                </div>
                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                  Vos concurrents
                </h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Générez des concurrents avec l&apos;IA puis cochez-en {COMP_REQ}, ou saisissez les vôtres.
                </p>
              </div>

              <button
                type="button"
                onClick={() => runAiFill(AI_COMPETITORS, setCompetitors, setCompLoading, "comp", COMP_REQ, 3)}
                disabled={aiBusy !== null}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-accent-pink/30 bg-accent-pink/[0.08] py-2.5 text-[13px] font-medium text-accent-pink transition-all duration-200 hover:bg-accent-pink/[0.14] active:scale-[0.98] disabled:cursor-default disabled:opacity-70"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <svg className={`h-4 w-4 ${aiBusy === "comp" ? "animate-pulse" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                {aiBusy === "comp" ? "Recherche des concurrents…" : "Générer avec l'IA"}
              </button>

              <div className="mb-2 flex items-center justify-between px-0.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">Concurrents</span>
                <span className={`text-[12px] font-medium ${compChecked >= COMP_REQ ? "text-accent-pink" : "text-text-muted"}`}>
                  {compChecked}/{COMP_MAX} sélectionné{compChecked > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {competitors.map((item, i) =>
                  renderRow(item, i, compLoading[i] ?? false, compChecked, COMP_MAX, setCompetitors, `https://concurrent${i + 1}.com`),
                )}
              </div>

              {error && (
                <p className="mt-3 flex items-center gap-1.5 text-[12px] text-red-400">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  {error}
                </p>
              )}

              <div className="mt-6">
                <Button variant="primary" fullWidth onClick={handleStep1} disabled={compChecked < COMP_REQ || aiBusy !== null}>
                  Continuer
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Keywords */
            <div className="relative" style={{ animation: "fade-up 300ms var(--ease-expo) both" }}>
              <button
                onClick={() => { setStep(1); setError(""); }}
                className="mb-4 flex items-center gap-1.5 text-[13px] text-text-muted transition-colors duration-200 hover:text-text-primary"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Retour
              </button>

              <div className="mb-5 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                    <path d="M6 6h.008v.008H6V6Z" />
                  </svg>
                </div>
                <h2 className="mb-1 text-[20px] font-medium tracking-[-0.4px] text-text-primary">
                  Vos mots-clés cibles
                </h2>
                <p className="text-[14px] font-extralight leading-relaxed text-text-secondary">
                  Générez des mots-clés avec l&apos;IA puis cochez-en {KW_REQ} à {KW_MAX}, ou saisissez les vôtres.
                </p>
              </div>

              <form onSubmit={handleStep2} className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => runAiFill(AI_KEYWORDS, setKeywords, setKwLoading, "kw", KW_REQ, 5)}
                  disabled={aiBusy !== null}
                  className="mb-0.5 flex w-full items-center justify-center gap-2 rounded-xl border border-accent-pink/30 bg-accent-pink/[0.08] py-2.5 text-[13px] font-medium text-accent-pink transition-all duration-200 hover:bg-accent-pink/[0.14] active:scale-[0.98] disabled:cursor-default disabled:opacity-70"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <svg className={`h-4 w-4 ${aiBusy === "kw" ? "animate-pulse" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                  {aiBusy === "kw" ? "Recherche des mots-clés…" : "Générer avec l'IA"}
                </button>

                <div className="mb-0.5 mt-1 flex items-center justify-between px-0.5">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">Mots-clés</span>
                  <span className={`text-[12px] font-medium ${kwChecked >= KW_REQ ? "text-accent-pink" : "text-text-muted"}`}>
                    {kwChecked}/{KW_MAX} sélectionné{kwChecked > 1 ? "s" : ""}
                  </span>
                </div>

                {keywords.map((item, i) =>
                  renderRow(item, i, kwLoading[i] ?? false, kwChecked, KW_MAX, setKeywords, `Mot-clé ${i + 1}`),
                )}

                {error && (
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-red-400">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {error}
                  </p>
                )}

                <div className="mt-3">
                  <Button variant="primary" type="submit" fullWidth disabled={kwChecked < KW_REQ || aiBusy !== null}>
                    Débloquer mon score
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
