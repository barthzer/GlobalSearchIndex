"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchProjectScores, type ProjectScore } from "@/lib/scores";
import { fetchForecast, saveForecast } from "@/lib/forecast";
import {
  sectors,
  scenarioMeta,
  deriveImpressionsFromCompetitors,
  fmtImpressionsHint,
  fmtNumber,
  fmtEur,
  type SemanticRawData,
} from "@/lib/projection-data";

// Projection de CA — logique métier REPRISE À L'IDENTIQUE de la prod apps/web
// (16 secteurs calibrés, impressions dérivées du trafic RÉEL des concurrents,
// scénarios avec ctrMul, calcul client-side). Le backend ne PERSISTE que les
// inputs commerciaux (secteur, conversion, panier). Migration = design changé,
// logique métier inchangée. Pas de sémantique → empty state (jamais de mock).

export default function ProjectionView({ projectId }: { projectId: string }) {
  const [scores, setScores] = useState<ProjectScore[] | null>(null);
  const [error, setError] = useState(false);

  // Inputs commerciaux (chaînes pour la saisie, parsées ensuite).
  const [sectorIdx, setSectorIdx] = useState<number>(-1);
  const [convStr, setConvStr] = useState("");
  const [basketStr, setBasketStr] = useState("");
  const [ctrCustom, setCtrCustom] = useState<number | null>(null); // en %

  const [sectorOpen, setSectorOpen] = useState(false);
  const [showCtrEdit, setShowCtrEdit] = useState(false);
  const [ctrDraft, setCtrDraft] = useState("");

  const hydratedRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const conv = useMemo(() => {
    const v = parseFloat(convStr);
    return Number.isFinite(v) ? Math.max(0, v) : 0;
  }, [convStr]);
  const basket = useMemo(() => {
    const v = parseFloat(basketStr);
    return Number.isFinite(v) ? Math.max(0, v) : 0;
  }, [basketStr]);

  // Scores (pour le score sémantique → impressions) + forecast persisté (hydrate
  // secteur/conv/panier). Le forecast est non-bloquant : les inputs se remplissent
  // quand le GET répond, sans retarder l'affichage.
  useEffect(() => {
    if (!projectId) return;
    let active = true;
    hydratedRef.current = false;
    setScores(null);
    setError(false);
    setSectorIdx(-1);
    setConvStr("");
    setBasketStr("");
    setCtrCustom(null);
    fetchProjectScores(projectId)
      .then((s) => {
        if (active) setScores(s);
      })
      .catch(() => {
        if (active) setError(true);
      });
    fetchForecast(projectId)
      .then((fc) => {
        if (!active) return;
        if (fc.conversion_rate != null) setConvStr(String(fc.conversion_rate));
        if (fc.average_basket != null) setBasketStr(String(fc.average_basket));
        if (fc.sector) {
          const idx = sectors.findIndex((s) => s.label === fc.sector);
          if (idx >= 0) setSectorIdx(idx);
        }
      })
      .catch(() => {
        /* pas de row : reste vide */
      })
      .finally(() => {
        if (active) hydratedRef.current = true;
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  // Auto-save debouncé (persistance seule) : secteur (label), conversion, panier.
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveForecast(projectId, {
        conversion_rate: conv,
        average_basket: basket,
        sector: sectorIdx >= 0 ? sectors[sectorIdx].label : undefined,
      }).catch(() => {
        /* best-effort : le PATCH suivant réessaie */
      });
    }, 1000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [projectId, sectorIdx, conv, basket]);

  // Impressions dérivées du trafic RÉEL des concurrents (score sémantique completed).
  const derived = useMemo(() => {
    const semantic = scores?.find(
      (s) => s.scoreType === "semantic" && s.status === "completed",
    );
    return deriveImpressionsFromCompetitors(
      (semantic?.rawData as SemanticRawData | null) ?? null,
    );
  }, [scores]);

  const ctrSector = sectorIdx >= 0 ? sectors[sectorIdx].ctr : 0;
  const ctrBase = ctrCustom ?? ctrSector;
  const hasSector = sectorIdx >= 0;

  // Scénarios effectifs : impressions réelles par hypothèse (pess/réal/opt).
  const effective = useMemo(() => {
    if (!derived) return [];
    const keys: ("pessimistic" | "realistic" | "optimistic")[] = [
      "pessimistic",
      "realistic",
      "optimistic",
    ];
    return scenarioMeta.map((s, i) => ({
      ...s,
      imp: derived[keys[i]],
      hint: fmtImpressionsHint(derived[keys[i]]),
    }));
  }, [derived]);

  // Calcul client-side IDENTIQUE prod : ctr = ctrBase × ctrMul ; traf = imp × ctr% ;
  // leads = traf × conv% ; ca = leads × panier.
  const results = useMemo(() => {
    if (!hasSector || effective.length === 0) return null;
    const data = effective.map((s) => {
      const ctr = ctrBase * s.ctrMul;
      const traf = Math.round(s.imp * (ctr / 100));
      const leads = Math.round(traf * (conv / 100));
      const ca = leads * basket;
      return { ...s, ctr, traf, leads, ca };
    });
    const maxCa = data[2].ca || 1;
    const lever = data[0].ca > 0 ? Math.round(data[2].ca / data[0].ca) : 0;
    return { data, maxCa, lever, annual: data[1].ca * 12 };
  }, [hasSector, effective, ctrBase, conv, basket]);

  // ─── États de chargement / erreur (après TOUS les hooks) ───
  if (error) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-card p-6 text-[13px] text-text-muted">
        Impossible de charger la projection, réessayez.
      </div>
    );
  }
  if (!scores) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
        ))}
      </div>
    );
  }

  const noSemantic = derived === null;

  return (
    <div className="animate-fade-up">
      {/* Inputs */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Secteur — TOUJOURS activable (le référentiel ne dépend pas du sémantique) */}
        <div className="relative flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            Secteur d&apos;activité
          </label>
          <button
            onClick={() => setSectorOpen(!sectorOpen)}
            className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-[length:var(--text-body)] font-light outline-none transition-colors duration-200 ${
              sectorOpen
                ? "border-accent-pink/50 bg-accent-pink/5 text-text-primary"
                : "border-border-subtle bg-card-inner-bg text-text-primary"
            }`}
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <span className={`flex items-center gap-2 ${!hasSector ? "text-text-muted" : ""}`}>
              {hasSector && (
                <span className="text-text-muted">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={sectors[sectorIdx].iconPath} />
                  </svg>
                </span>
              )}
              {hasSector ? sectors[sectorIdx].label : "Sélectionner un secteur"}
            </span>
            <svg
              className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${sectorOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {sectorOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSectorOpen(false)} />
              <div
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border-subtle bg-bg-primary p-1"
                style={{
                  boxShadow: "0 12px 32px -4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
                  animation: "dropdown-in 200ms var(--ease-out) both",
                }}
              >
                {sectors.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => { setSectorIdx(i); setCtrCustom(null); setSectorOpen(false); }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[length:var(--text-body)] font-light transition-colors duration-150 ${
                      sectorIdx === i
                        ? "bg-accent-pink/10 text-text-primary"
                        : "text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
                    }`}
                  >
                    <span className="text-text-muted">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={s.iconPath} />
                      </svg>
                    </span>
                    {s.label}
                    {sectorIdx === i && (
                      <svg className="ml-auto h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Conversion */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Taux de conversion (%)
          </label>
          <div className="flex items-center rounded-xl border border-border-subtle bg-card-inner-bg transition-colors duration-200 focus-within:border-accent-pink/50 focus-within:bg-accent-pink/5">
            <input
              type="text"
              inputMode="decimal"
              value={convStr}
              onChange={(e) => setConvStr(e.target.value)}
              placeholder="ex : 2"
              className="w-full bg-transparent px-4 py-2.5 text-left text-[length:var(--text-body)] font-light text-text-primary outline-none"
            />
            <div className="flex shrink-0 flex-col">
              <button
                onClick={() => setConvStr(String(Math.min(30, +(conv + 0.1).toFixed(1))))}
                className="flex h-5 w-8 items-center justify-center text-text-muted transition-colors duration-150 hover:text-text-primary active:scale-[0.95]"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
              </button>
              <button
                onClick={() => setConvStr(String(Math.max(0, +(conv - 0.1).toFixed(1))))}
                className="flex h-5 w-8 items-center justify-center text-text-muted transition-colors duration-150 hover:text-text-primary active:scale-[0.95]"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Panier */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            Panier moyen (EUR)
          </label>
          <div className="flex items-center rounded-xl border border-border-subtle bg-card-inner-bg transition-colors duration-200 focus-within:border-accent-pink/50 focus-within:bg-accent-pink/5">
            <input
              type="text"
              inputMode="numeric"
              value={basketStr}
              onChange={(e) => setBasketStr(e.target.value)}
              placeholder="ex : 150"
              className="w-full bg-transparent px-4 py-2.5 text-left text-[length:var(--text-body)] font-light text-text-primary outline-none"
            />
            <div className="flex shrink-0 flex-col">
              <button
                onClick={() => setBasketStr(String(basket + 10))}
                className="flex h-5 w-8 items-center justify-center text-text-muted transition-colors duration-150 hover:text-text-primary active:scale-[0.95]"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
              </button>
              <button
                onClick={() => setBasketStr(String(Math.max(0, basket - 10)))}
                className="flex h-5 w-8 items-center justify-center text-text-muted transition-colors duration-150 hover:text-text-primary active:scale-[0.95]"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTR benchmark */}
      {hasSector && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="text-[13px] font-light text-text-secondary">
            CTR benchmark réseau de recherche
          </span>
          <button
            onClick={() => { setCtrDraft(ctrBase.toFixed(2)); setShowCtrEdit(true); }}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent-pink/20 bg-accent-pink/10 px-2.5 py-0.5 text-[13px] font-semibold text-accent-pink-light transition-all duration-200 hover:bg-accent-pink/20 active:scale-[0.97]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            {ctrBase.toFixed(2)}%
            <svg className="h-3 w-3 text-accent-pink-light/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
          </button>
          <span className="text-[12px] font-light text-text-muted">
            {ctrCustom !== null ? "valeur personnalisée" : "benchmark secteur"}
          </span>
        </div>
      )}

      {/* CTR edit modal */}
      {showCtrEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md" onClick={() => setShowCtrEdit(false)} style={{ animation: "fade-up 300ms var(--ease-expo) both" }} />
          <div className="relative w-full max-w-[340px] rounded-2xl border border-white/[0.06] bg-input-bg p-2" style={{ animation: "fade-up 400ms var(--ease-expo) both" }}>
            <div className="relative rounded-[calc(1rem)] border border-border-subtle bg-modal-bg p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <button
                onClick={() => setShowCtrEdit(false)}
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-[length:var(--text-body-lg)] font-medium text-text-primary">
                Modifier le CTR
              </h3>
              <p className="mt-1 text-[13px] font-light text-text-secondary">
                Remplace le CTR benchmark du secteur par une valeur personnalisée.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={ctrDraft}
                  onChange={(e) => setCtrDraft(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-border-subtle bg-card-inner-bg px-4 py-2.5 text-[length:var(--text-body)] font-light text-text-primary outline-none transition-colors duration-200 focus:border-accent-pink/50 focus:bg-accent-pink/5"
                  placeholder="ex : 3.5"
                />
                <span className="text-[length:var(--text-body)] font-medium text-text-muted">%</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    const v = parseFloat(ctrDraft);
                    if (!isNaN(v) && v > 0) { setCtrCustom(v); setShowCtrEdit(false); }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent-purple via-accent-pink via-[47%] to-accent-pink-light px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  Appliquer
                </button>
                {ctrCustom !== null && (
                  <button
                    onClick={() => { setCtrCustom(null); setShowCtrEdit(false); }}
                    className="rounded-full px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Résultats */}
      <div className="relative">
        {results ? (
          <div className="animate-fade-up" key={`${sectorIdx}-${conv}-${basket}-${ctrCustom}`}>
            {/* Hero fourchette */}
            <div
              className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px]"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 items-end gap-1">
                  {results.data.map((s, i) => (
                    <div
                      key={s.tag}
                      className="w-1.5 rounded-full bg-accent-pink transition-all duration-700"
                      style={{
                        height: `${Math.max(8, Math.round((s.ca / results.maxCa) * 48))}px`,
                        opacity: i === 0 ? 0.35 : i === 1 ? 0.65 : 1,
                        transitionTimingFunction: "var(--ease-out)",
                      }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    Potentiel de CA, fourchette SEO
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-text-primary">{fmtEur(results.data[0].ca)}</span>
                    <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                    <span className="text-2xl font-bold tracking-tight text-text-primary">{fmtEur(results.data[2].ca)}</span>
                  </div>
                  <p className="mt-1 text-[12px] font-light text-text-muted">
                    selon les hypothèses pessimiste à optimiste
                  </p>
                </div>
              </div>
              {results.lever > 0 && (
                <div className="flex flex-col items-center rounded-xl border border-border-subtle bg-card-inner-bg px-5 py-3">
                  <span
                    className="block pb-0.5 text-2xl font-bold tracking-tighter leading-none"
                    style={{
                      backgroundImage: "linear-gradient(to bottom, var(--accent-pink-light), var(--accent-pink))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    x{results.lever}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">levier SEO</span>
                </div>
              )}
            </div>

            {/* Scenario cards */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {results.data.map((s, i) => (
                <div
                  key={s.tag}
                  className={`overflow-hidden rounded-xl border ${s.featured ? "border-accent-pink/20" : "border-border-subtle"}`}
                  style={{
                    background: i === 0
                      ? "linear-gradient(to bottom, var(--bg-card) 0%, rgba(148,163,184,0.08) 100%)"
                      : i === 1
                        ? "linear-gradient(to bottom, var(--bg-card) 0%, rgba(236,77,203,0.1) 100%)"
                        : "linear-gradient(to bottom, var(--bg-card) 0%, rgba(52,211,153,0.1) 100%)",
                  }}
                >
                  <div className="border-b border-border-subtle p-5">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                      i === 0
                        ? "text-text-muted border-border-subtle bg-card-inner-bg"
                        : i === 1
                          ? "text-accent-pink border-accent-pink/20 bg-accent-pink/10"
                          : "text-success border-success/20 bg-success/10"
                    }`}>
                      {s.tag}
                    </span>
                    <p className="mt-2 text-[length:var(--text-body-lg)] font-medium text-text-primary">{s.name}</p>
                    <p className="mt-0.5 text-[13px] font-light text-text-secondary">{s.hint}</p>
                  </div>
                  <div className="p-5">
                    {[
                      { label: "Impressions", value: fmtNumber(s.imp) },
                      { label: "CTR appliqué", value: s.ctr.toFixed(2) + "%", hi: true },
                      { label: "Trafic SEO", value: fmtNumber(s.traf) + " visites" },
                      { label: "Leads / transactions", value: fmtNumber(s.leads) },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between border-b border-border-subtle/50 py-2.5 last:border-b-0">
                        <span className="text-[13px] font-light text-text-secondary">{row.label}</span>
                        <span className={`text-[14px] font-semibold tabular-nums ${row.hi ? "text-accent-pink-light" : "text-text-primary"}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border-subtle bg-card-inner-bg p-5">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">CA potentiel</p>
                    <p
                      className="mt-1.5 text-2xl font-bold tracking-tight"
                      style={{
                        backgroundImage: i === 0
                          ? "linear-gradient(to bottom, var(--text-secondary), var(--text-primary))"
                          : i === 1
                            ? "linear-gradient(to bottom, var(--accent-pink-light), var(--accent-pink))"
                            : "linear-gradient(to bottom, var(--color-success), #059669)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {fmtEur(s.ca)}
                    </p>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-border-subtle">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${i === 0 ? "bg-text-muted" : i === 1 ? "bg-accent-pink" : "bg-success"}`}
                        style={{ width: `${Math.round((s.ca / results.maxCa) * 100)}%`, transitionTimingFunction: "var(--ease-out)" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Annual strip */}
            <div className="mb-16 flex items-center justify-between rounded-xl border border-accent-pink/15 bg-accent-pink/5 px-5 py-3">
              <span className="text-[13px] font-light text-text-secondary">
                Projection sur <span className="font-medium text-text-primary">12 mois</span>, scénario réaliste
              </span>
              <span className="text-[length:var(--text-body-lg)] font-bold tracking-tight text-accent-pink-light">
                {fmtEur(results.annual)}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border-subtle bg-bg-card"
            style={{ background: "linear-gradient(180deg, var(--bg-card) 0%, rgba(236,77,203,0.12) 100%)" }}
          >
            <div className="flex max-w-md flex-col items-center px-8 py-8 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-accent-pink/15 bg-accent-pink/10">
                <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              {noSemantic ? (
                <>
                  <p className="text-[length:var(--text-body)] font-medium text-text-secondary">
                    Projection indisponible
                  </p>
                  <p className="mt-1 text-[13px] font-light leading-relaxed text-text-muted">
                    Les impressions s&apos;appuient sur le trafic réel des concurrents
                    (analyse sémantique). Débloquez l&apos;analyse concurrentielle pour
                    l&apos;activer. Aucun volume n&apos;est inventé.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[length:var(--text-body)] font-medium text-text-secondary">
                    Choisissez un secteur
                  </p>
                  <p className="mt-1 text-[12px] font-light text-text-muted">
                    Sélectionnez un secteur d&apos;activité pour afficher les projections.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
