"use client";

import ModalPortal from "./ModalPortal";
import { useState, useRef, useEffect } from "react";
import Button from "./Button";
import { getSemanticInputs, saveSemanticInputs, type SemanticInputs } from "@/lib/semanticInputs";
import { apiFetch } from "@/lib/api";

interface SemanticUnlockModalProps {
  onClose: () => void;
  onSubmit: () => void;
  /** Projet courant : cible des appels réels (génération, submit, écart de taille). */
  projectId: string;
  /** Mode benchmark concurrents : uniquement l'étape concurrents (pas de mots-clés). */
  competitorsOnly?: boolean;
  /** Libellé du bouton final (mode competitorsOnly). */
  submitLabel?: string;
}

type Item = { value: string; checked: boolean };

// Génération vide RÉELLE (le preview a tourné mais rendu zéro concurrent : site
// très récent / secteur de niche). Message qui dit ce que l'utilisateur PEUT faire.
const NO_COMP_MSG =
  "Aucun concurrent n'a pu être proposé automatiquement, ce qui arrive sur un site très récent ou un secteur de niche. Saisissez au moins un acteur de votre secteur, même plus gros : il sert de point de comparaison. C'est une limite de notre source de données, pas une erreur de votre part.";

// Preview INDISPONIBLE (n'a pas pu tourner : timeout Haloscan à la création). Ce
// n'est PAS une limite de la source — c'est transitoire, donc réessayable. À ne
// jamais confondre avec NO_COMP_MSG (qui, lui, suppose un preview vide réel).
const PREVIEW_UNAVAILABLE_MSG =
  "La génération n'a pas pu aboutir pour l'instant. Réessayez dans un instant, ou saisissez directement les acteurs de votre secteur.";

// Le preview a bien tourné mais la PROPOSITION automatique (passe IA) n'a pas
// abouti — cas non transitoire (pas un ordre de réessayer en boucle). Le prospect
// saisit directement, l'analyse fonctionne quand même.
const GEN_UNAVAILABLE_MSG =
  "La proposition automatique n'est pas disponible. Saisissez directement les acteurs de votre secteur.";

// Bornes corrigées (SEO Engine v7.30 : 1-3 concurrents + 5-10 mots-clés).
const COMP_MAX = 3;
const COMP_MIN = 1;
const KW_MAX = 10;
const KW_MIN = 5;

const emptyItems = (n: number): Item[] => Array.from({ length: n }, () => ({ value: "", checked: false }));

/** Items pré-remplis depuis le store (cochés, éditables). */
function itemsFromStore(values: string[], min: number, max: number): Item[] {
  const items: Item[] = values.slice(0, max).map((value) => ({ value, checked: true }));
  while (items.length < min) items.push({ value: "", checked: false });
  return items;
}

export default function SemanticUnlockModal({ onClose, onSubmit, projectId, competitorsOnly = false, submitLabel }: SemanticUnlockModalProps) {
  // Lecture du store une seule fois au montage (pré-remplissage lié au benchmark).
  const stored = useRef<SemanticInputs>(getSemanticInputs()).current;
  const compInit = stored.competitors.length ? itemsFromStore(stored.competitors, 3, COMP_MAX) : emptyItems(3);
  const kwInit = stored.keywords.length ? itemsFromStore(stored.keywords, 5, KW_MAX) : emptyItems(5);

  const [step, setStep] = useState<1 | 2>(1);
  const [competitors, setCompetitors] = useState<Item[]>(compInit);
  const [keywords, setKeywords] = useState<Item[]>(kwInit);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [aiBusy, setAiBusy] = useState<null | "comp" | "kw">(null);
  const [compLoading, setCompLoading] = useState<boolean[]>(() => Array(compInit.length).fill(false));
  const [kwLoading, setKwLoading] = useState<boolean[]>(() => Array(kwInit.length).fill(false));

  // Écart de taille (M5) : ref_domains de chaque concurrent vs le prospect.
  // Débouncé + dédup session + non-bloquant (le submit reste actif).
  type SizeResult = { ref_domains: number | null; ratio: number | null };
  const [sizes, setSizes] = useState<Record<string, SizeResult>>({});
  const [sizing, setSizing] = useState<Set<string>>(new Set());
  const sizesRef = useRef(sizes);
  const sizingRef = useRef(sizing);
  const sizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { sizesRef.current = sizes; }, [sizes]);
  useEffect(() => { sizingRef.current = sizing; }, [sizing]);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const compChecked = competitors.filter((c) => c.checked).length;
  const kwChecked = keywords.filter((k) => k.checked).length;

  // Mesure d'écart : après STABILISATION du set concurrents cochés (débounce 1,5s),
  // jamais à la frappe. Dédup par domaine (session + cache serveur). Non-bloquant :
  // le submit reste actif, les badges arrivent quand ils arrivent.
  const checkedKey = competitors
    .filter((c) => c.checked && c.value.trim())
    .map((c) => c.value.trim())
    .join("|");
  useEffect(() => {
    if (sizeDebounceRef.current) clearTimeout(sizeDebounceRef.current);
    const domains = checkedKey ? checkedKey.split("|") : [];
    if (domains.length === 0) return;
    sizeDebounceRef.current = setTimeout(async () => {
      const toMeasure = domains
        .filter((d) => !(d in sizesRef.current) && !sizingRef.current.has(d))
        .slice(0, 3);
      if (toMeasure.length === 0) return;
      setSizing((prev) => new Set([...prev, ...toMeasure]));
      try {
        const res = await apiFetch(`/projects/${projectId}/competitor-size`, {
          method: "POST",
          body: JSON.stringify({ competitors: toMeasure }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            competitors?: { domain: string; ref_domains: number | null; ratio: number | null }[];
          };
          const next: Record<string, SizeResult> = {};
          (data.competitors ?? []).forEach((c) => {
            next[c.domain] = { ref_domains: c.ref_domains, ratio: c.ratio };
          });
          if (mounted.current) setSizes((prev) => ({ ...prev, ...next }));
        }
      } catch {
        // Silencieux côté données : jamais un faux chiffre ; le badge reste absent.
      } finally {
        if (mounted.current) {
          setSizing((prev) => {
            const n = new Set(prev);
            toMeasure.forEach((d) => n.delete(d));
            return n;
          });
        }
      }
    }, 1500);
    return () => {
      if (sizeDebounceRef.current) clearTimeout(sizeDebounceRef.current);
    };
  }, [checkedKey, projectId]);

  /**
   * Révèle les candidats un par un : chaque ligne apparaît vide et "cherche" (pulsation),
   * puis se remplit. Les lignes remplies par l'IA passent en mode affichage (crayon pour éditer).
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

    const APPEAR = 150;
    const SEARCH_PAUSE = 750;
    const FILL = 300;

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

  // Génération RÉELLE (POST /semantic/generate) : la même passe LLM propose
  // concurrents + mots-clés du secteur. Anime les vrais candidats via runAiFill.
  async function handleGenerate(key: "comp" | "kw") {
    if (aiBusy) return;
    setAiBusy(key);
    setError("");
    try {
      const res = await apiFetch(`/projects/${projectId}/semantic/generate`, {
        method: "POST",
        body: "{}",
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as {
        generated?: boolean;
        competitors?: string[];
        keywords?: string[];
        previewAvailable?: boolean;
      };
      // Défaut prudent : champ absent → traité comme indisponible (réessayable),
      // jamais le message niche à tort.
      const previewAvailable = data.previewAvailable === true;
      const cap = key === "comp" ? COMP_MAX : KW_MAX;
      const candidates = (key === "comp" ? data.competitors ?? [] : data.keywords ?? []).slice(0, cap);
      // (a) Preview indisponible (n'a pas pu tourner) → transitoire, réessayable.
      if (!previewAvailable) {
        setAiBusy(null);
        setError(PREVIEW_UNAVAILABLE_MSG);
        return;
      }
      // (b) Preview OK mais la proposition IA a échoué (non transitoire) → saisie
      //     manuelle, sans promesse de réessai infini. Découplé de (a).
      if (!data.generated) {
        setAiBusy(null);
        setError(GEN_UNAVAILABLE_MSG);
        return;
      }
      // (c) Preview a tourné mais 0 candidat → vide RÉEL (récent/niche).
      if (candidates.length === 0) {
        setAiBusy(null);
        setError(
          key === "comp"
            ? NO_COMP_MSG
            : "Aucun mot-clé n'a pu être proposé. Saisissez ceux de votre activité.",
        );
        return;
      }
      // (d) Candidats proposés → préremplissage (chemin de succès).
      if (key === "comp") {
        runAiFill(candidates, setCompetitors, setCompLoading, "comp", COMP_MAX, candidates.length);
      } else {
        runAiFill(candidates, setKeywords, setKwLoading, "kw", KW_MAX, candidates.length);
      }
    } catch {
      setAiBusy(null);
      setError("La génération a échoué. Réessayez, ou saisissez à la main.");
    }
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

  /** Ajoute une ligne vide éditable sous la liste (saisie manuelle d'un concurrent / mot-clé). */
  function addRow(
    setList: React.Dispatch<React.SetStateAction<Item[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean[]>>,
    idPrefix: string,
  ) {
    let newIdx = 0;
    setList((prev) => {
      newIdx = prev.length;
      return [...prev, { value: "", checked: false }];
    });
    setLoading((prev) => [...prev, false]);
    setTimeout(() => document.getElementById(`${idPrefix}-${newIdx}`)?.focus(), 0);
  }

  async function persistAndSubmit(payload: Partial<SemanticInputs>) {
    saveSemanticInputs(payload);
    setSubmitting(true);
    try {
      // Mode benchmark (concurrents seuls) → notoriété ; sinon → sémantique complet.
      if (competitorsOnly) {
        const res = await apiFetch(`/projects/${projectId}/notoriete/benchmark`, {
          method: "POST",
          body: JSON.stringify({ competitors: payload.competitors ?? [] }),
        });
        if (!res.ok) throw new Error(String(res.status));
      } else {
        const res = await apiFetch(`/projects/${projectId}/semantic`, {
          method: "POST",
          body: JSON.stringify({
            competitors: payload.competitors ?? [],
            keywords: payload.keywords ?? [],
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
      }
      // On laisse la vibration se jouer avant de fermer / révéler le loader.
      setTimeout(() => { if (mounted.current) onSubmit(); }, 560);
    } catch {
      if (mounted.current) {
        setSubmitting(false);
        setError("Le lancement de l'analyse a échoué. Réessayez.");
      }
    }
  }

  function handleStep1() {
    if (compChecked < COMP_MIN) {
      setError(
        "Saisissez au moins un concurrent. Si vous n'en connaissez pas, cliquez sur « Générer avec l'IA » : l'outil vous en propose dans votre secteur. C'est une contrainte de notre source de données, pas une erreur de votre part.",
      );
      return;
    }
    setError("");
    if (competitorsOnly) {
      persistAndSubmit({ competitors: competitors.filter((c) => c.checked).map((c) => c.value.trim()) });
      return;
    }
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    if (kwChecked < KW_MIN) {
      setError(`Sélectionnez au moins ${KW_MIN} mots-clés.`);
      return;
    }
    persistAndSubmit({
      competitors: competitors.filter((c) => c.checked).map((c) => c.value.trim()),
      keywords: keywords.filter((k) => k.checked).map((k) => k.value.trim()),
    });
  }

  function renderRow(
    item: Item,
    i: number,
    loading: boolean,
    checkedCount: number,
    max: number,
    setList: React.Dispatch<React.SetStateAction<Item[]>>,
    placeholder: string,
    idPrefix: string,
  ) {
    const atCap = !item.checked && checkedCount >= max;
    const canCheck = !loading && item.value.trim().length > 0 && !atCap;
    return (
      <div key={i} className="relative" style={{ animation: "fade-up 380ms var(--ease-out) both" }}>
        <input
          id={`${idPrefix}-${i}`}
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

        {/* Check sélection — à droite */}
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

        {/* Badge d'écart de taille (concurrents uniquement) : lisible, jamais un
            chiffre nu. « à vérifier » si non mesuré (jamais un vide silencieux). */}
        {idPrefix === "comp" && item.value.trim() && !loading && (() => {
          const d = item.value.trim();
          if (sizing.has(d)) {
            return (
              <p className="mt-1.5 pl-1 text-[11px] italic text-text-muted animate-pulse">
                Analyse de la taille du concurrent…
              </p>
            );
          }
          const r = sizes[d];
          if (!r) return null;
          if (r.ratio === null) {
            return (
              <p className="mt-1.5 pl-1 text-[11px] text-text-muted">
                Autorité non mesurée pour ce domaine : vérifiez qu&apos;il s&apos;agit bien d&apos;un concurrent réel.
              </p>
            );
          }
          if (r.ratio >= 2) {
            return (
              <p className="mt-1.5 pl-1 text-[11px] text-amber-400">
                {Math.round(r.ratio)}× plus de domaines référents que votre prospect. National ou régional ?
              </p>
            );
          }
          return (
            <p className="mt-1.5 pl-1 text-[11px] text-text-secondary">
              Profil comparable au vôtre en domaines référents.
            </p>
          );
        })()}
      </div>
    );
  }

  const finalLabel = submitLabel ?? "Calculer mon score sémantique";

  return (
    <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
        onClick={onClose}
        style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
      />

      <div
        className={`relative w-full max-w-[440px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2 ${submitting ? "shake-x" : ""}`}
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
            className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Steps indicator (masqué en mode concurrents seuls) */}
          {!competitorsOnly && (
            <div className="mb-6 mr-10 flex items-center gap-2">
              <div className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: step === 1 ? "var(--accent-pink)" : "rgba(236,77,203,0.45)" }} />
              <div className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: step === 2 ? "var(--accent-pink)" : "var(--step-future)" }} />
            </div>
          )}

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
                  Générez des concurrents avec l&apos;IA puis cochez-en {COMP_MIN} à {COMP_MAX}, ou saisissez les vôtres.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleGenerate("comp")}
                disabled={aiBusy !== null || submitting}
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
                <span className={`text-[12px] font-medium ${compChecked >= COMP_MIN ? "text-accent-pink" : "text-text-muted"}`}>
                  {compChecked}/{COMP_MAX} sélectionné{compChecked > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {competitors.map((item, i) =>
                  renderRow(item, i, compLoading[i] ?? false, compChecked, COMP_MAX, setCompetitors, `https://concurrent${i + 1}.com`, "comp"),
                )}
                <button
                  type="button"
                  onClick={() => addRow(setCompetitors, setCompLoading, "comp")}
                  disabled={aiBusy !== null || submitting}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-badge bg-transparent py-2.5 text-[13px] font-medium text-text-muted transition-all duration-200 hover:border-accent-pink/40 hover:text-accent-pink active:scale-[0.99] disabled:opacity-50"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Ajouter un concurrent
                </button>
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
                {/* Jamais désactivé sur le compte : le clic déclenche la validation
                    qui DIT pourquoi (message ci-dessus), pas un bouton muet. */}
                <Button variant="primary" fullWidth onClick={handleStep1} disabled={aiBusy !== null || submitting}>
                  {submitting ? "Lancement…" : competitorsOnly ? finalLabel : "Continuer"}
                  {competitorsOnly ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  )}
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
                  Générez des mots-clés avec l&apos;IA puis cochez-en {KW_MIN} à {KW_MAX}, ou saisissez les vôtres.
                </p>
              </div>

              <form onSubmit={handleStep2} className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => handleGenerate("kw")}
                  disabled={aiBusy !== null || submitting}
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
                  <span className={`text-[12px] font-medium ${kwChecked >= KW_MIN ? "text-accent-pink" : "text-text-muted"}`}>
                    {kwChecked}/{KW_MAX} sélectionné{kwChecked > 1 ? "s" : ""}
                  </span>
                </div>

                {keywords.map((item, i) =>
                  renderRow(item, i, kwLoading[i] ?? false, kwChecked, KW_MAX, setKeywords, `Mot-clé ${i + 1}`, "kw"),
                )}
                <button
                  type="button"
                  onClick={() => addRow(setKeywords, setKwLoading, "kw")}
                  disabled={aiBusy !== null || submitting}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-badge bg-transparent py-2.5 text-[13px] font-medium text-text-muted transition-all duration-200 hover:border-accent-pink/40 hover:text-accent-pink active:scale-[0.99] disabled:opacity-50"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Ajouter un mot-clé
                </button>

                {error && (
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-red-400">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {error}
                  </p>
                )}

                <div className="mt-3">
                  <Button variant="primary" type="submit" fullWidth disabled={aiBusy !== null || submitting}>
                    {submitting ? "Lancement…" : "Calculer mon score sémantique"}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
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
