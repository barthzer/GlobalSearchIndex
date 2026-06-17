"use client";

import { useState, useMemo } from "react";

function SectorIcon({ d }: { d: string }) {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const sectors = [
  { label: "Avocat", ctr: 4.41, icon: <SectorIcon d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /> },
  { label: "Auto", ctr: 4.0, icon: <SectorIcon d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /> },
  { label: "B2B", ctr: 2.41, icon: <SectorIcon d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" /> },
  { label: "Services aux consommateurs", ctr: 2.41, icon: <SectorIcon d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /> },
  { label: "Rencontres et personnes", ctr: 6.05, icon: <SectorIcon d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /> },
  { label: "Ecommerce", ctr: 2.69, icon: <SectorIcon d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /> },
  { label: "Education", ctr: 3.78, icon: <SectorIcon d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /> },
  { label: "Services d'emploi", ctr: 2.42, icon: <SectorIcon d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /> },
  { label: "Finance & Assurance", ctr: 2.91, icon: <SectorIcon d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /> },
  { label: "Santé & Médical", ctr: 3.27, icon: <SectorIcon d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /> },
  { label: "Biens pour la maison", ctr: 2.44, icon: <SectorIcon d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
  { label: "Services industriels", ctr: 2.61, icon: <SectorIcon d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m0 0a2.678 2.678 0 0 1 .766-1.208l3.03-2.496M21 3l-2.25 2.25" /> },
  { label: "Juridique", ctr: 2.93, icon: <SectorIcon d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /> },
  { label: "Immobilier", ctr: 3.71, icon: <SectorIcon d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M15.75 21H8.25m6.75-18.75h4.5m-4.5 0v3h4.5m-4.5-3L12 3m0 0L5.625 7.045M12 3v3.375m0 0L5.625 7.045M12 6.375v3.375m-6.375-2.705v10.08c0 .621.504 1.125 1.125 1.125H9.75" /> },
  { label: "Technologie", ctr: 2.09, icon: <SectorIcon d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" /> },
  { label: "Voyages et hôtellerie", ctr: 4.68, icon: <SectorIcon d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /> },
];

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR");
}
function eur(n: number) {
  return Math.round(n).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

interface Scenario {
  tag: string;
  tagColor: string;
  name: string;
  hint: string;
  imp: number;
  ctrMul: number;
  featured?: boolean;
}

const scenarios: Scenario[] = [
  { tag: "Pessimiste", tagColor: "text-text-muted border-border-subtle bg-card-inner-bg", name: "Hypothèse basse", hint: "100 K imp.", imp: 100000, ctrMul: 0.7 },
  { tag: "Réaliste", tagColor: "text-accent-pink border-accent-pink/20 bg-accent-pink/10", name: "Hypothèse centrale", hint: "500 K imp.", imp: 500000, ctrMul: 1, featured: true },
  { tag: "Optimiste", tagColor: "text-success border-success/20 bg-success/10", name: "Hypothèse haute", hint: "1 M imp.", imp: 1000000, ctrMul: 1.3 },
];

export default function ProjectionView() {
  const [sectorIdx, setSectorIdx] = useState<number>(-1);
  const [sectorOpen, setSectorOpen] = useState(false);
  const [conv, setConv] = useState(2);
  const [basket, setBasket] = useState(150);
  const [ctrCustom, setCtrCustom] = useState<number | null>(null);
  const [showCtrEdit, setShowCtrEdit] = useState(false);
  const [ctrDraft, setCtrDraft] = useState("");

  const ctrSector = sectorIdx >= 0 ? sectors[sectorIdx].ctr : 0;
  const ctrBase = ctrCustom ?? ctrSector;
  const hasData = sectorIdx >= 0;

  function computeResults(ctr: number, c: number, b: number) {
    const data = scenarios.map((s) => {
      const ctrApplied = ctr * s.ctrMul;
      const traf = Math.round(s.imp * (ctrApplied / 100));
      const leads = Math.round(traf * (c / 100));
      const ca = leads * b;
      return { ...s, ctr: ctrApplied, traf, leads, ca };
    });
    const maxCa = data[2].ca || 1;
    const lever = data[0].ca > 0 ? Math.round(data[2].ca / data[0].ca) : 0;
    return { data, maxCa, lever, annual: data[1].ca * 12 };
  }

  const results = useMemo(
    () => (hasData ? computeResults(ctrBase, conv, basket) : null),
    [hasData, ctrBase, conv, basket]
  );

  // Preview data shown blurred behind the empty state — Ecommerce CTR (2.69%), conv 2%, basket 150€
  const previewResults = useMemo(() => computeResults(2.69, 2, 150), []);
  const displayResults = results ?? previewResults;

  return (
    <div className="animate-fade-up">
      {/* Inputs */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            <span className={`flex items-center gap-2 ${sectorIdx < 0 ? "text-text-muted" : ""}`}>
              {sectorIdx >= 0 && <span className="text-text-muted">{sectors[sectorIdx].icon}</span>}
              {sectorIdx >= 0 ? sectors[sectorIdx].label : "Sélectionner un secteur"}
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
                    <span className="text-text-muted">{s.icon}</span>
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
              value={conv}
              onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setConv(v); }}
              className="w-full bg-transparent px-4 py-2.5 text-left text-[length:var(--text-body)] font-light text-text-primary outline-none"
            />
            <div className="flex shrink-0 flex-col">
              <button
                onClick={() => setConv(Math.min(30, +(conv + 0.1).toFixed(1)))}
                className="flex h-5 w-8 items-center justify-center text-text-muted transition-colors duration-150 hover:text-text-primary active:scale-[0.95]"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
              </button>
              <button
                onClick={() => setConv(Math.max(0.1, +(conv - 0.1).toFixed(1)))}
                className="flex h-5 w-8 items-center justify-center text-text-muted transition-colors duration-150 hover:text-text-primary active:scale-[0.95]"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
            </div>
          </div>
        </div>
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
              value={basket}
              onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setBasket(v); }}
              className="w-full bg-transparent px-4 py-2.5 text-left text-[length:var(--text-body)] font-light text-text-primary outline-none"
            />
            <div className="flex shrink-0 flex-col">
              <button
                onClick={() => setBasket(basket + 10)}
                className="flex h-5 w-8 items-center justify-center text-text-muted transition-colors duration-150 hover:text-text-primary active:scale-[0.95]"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
              </button>
              <button
                onClick={() => setBasket(Math.max(1, basket - 10))}
                className="flex h-5 w-8 items-center justify-center text-text-muted transition-colors duration-150 hover:text-text-primary active:scale-[0.95]"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTR benchmark */}
      {hasData && (
        <div className="mb-5 flex items-center gap-3">
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
            {ctrCustom !== null ? "valeur personnalisée" : "scénario réaliste"}
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

      {/* Results — toujours visibles, blurred + overlay quand pas configuré */}
      <div className="relative">
        <div
          className={`animate-fade-up transition-all duration-300 ${results ? "" : "pointer-events-none select-none blur-[6px]"}`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
          key={results ? `${sectorIdx}-${conv}-${basket}` : "preview"}
          aria-hidden={!results}
        >
          {/* Hero fourchette */}
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px]"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-4">
              {/* Mini bar chart */}
              <div className="flex h-12 items-end gap-1">
                {displayResults.data.map((s, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-accent-pink transition-all duration-700"
                    style={{
                      height: `${Math.max(8, Math.round((s.ca / displayResults.maxCa) * 48))}px`,
                      opacity: i === 0 ? 0.35 : i === 1 ? 0.65 : 1,
                      transitionTimingFunction: "var(--ease-out)",
                    }}
                  />
                ))}
              </div>
              <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Potentiel de CA -- fourchette SEO
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-text-primary">
                  {eur(displayResults.data[0].ca)}
                </span>
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
                <span className="text-2xl font-bold tracking-tight text-text-primary">
                  {eur(displayResults.data[2].ca)}
                </span>
              </div>
              <p className="mt-1 text-[12px] font-light text-text-muted">
                selon les hypothèses pessimiste à optimiste
              </p>
              </div>
            </div>
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
                x{displayResults.lever}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                levier SEO
              </span>
            </div>
          </div>

          {/* Scenario cards */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {displayResults.data.map((s, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl border ${
                  s.featured
                    ? "border-accent-pink/20"
                    : "border-border-subtle"
                }`}
                style={{
                  background: i === 0
                    ? "linear-gradient(to bottom, var(--bg-card) 0%, rgba(148,163,184,0.08) 100%)"
                    : i === 1
                      ? "linear-gradient(to bottom, var(--bg-card) 0%, rgba(236,77,203,0.1) 100%)"
                      : "linear-gradient(to bottom, var(--bg-card) 0%, rgba(52,211,153,0.1) 100%)",
                }}
              >
                {/* Top */}
                <div className="border-b border-border-subtle p-5">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${s.tagColor}`}>
                    {s.tag}
                  </span>
                  <p className="mt-2 text-[length:var(--text-body-lg)] font-medium text-text-primary">{s.name}</p>
                  <p className="mt-0.5 text-[13px] font-light text-text-secondary">{s.hint}</p>
                </div>

                {/* Body */}
                <div className="p-5">
                  {[
                    { label: "Impressions", value: fmt(s.imp) },
                    { label: "CTR appliqué", value: s.ctr.toFixed(2) + "%", hi: true },
                    { label: "Trafic SEO", value: fmt(s.traf) + " visites" },
                    { label: "Leads / transactions", value: fmt(s.leads) },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between border-b border-border-subtle/50 py-2.5 last:border-b-0">
                      <span className="text-[13px] font-light text-text-secondary">{row.label}</span>
                      <span className={`text-[14px] font-semibold tabular-nums ${row.hi ? "text-accent-pink-light" : "text-text-primary"}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
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
                    {eur(s.ca)}
                  </p>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-border-subtle">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        i === 0 ? "bg-text-muted" : i === 1 ? "bg-accent-pink" : "bg-success"
                      }`}
                      style={{
                        width: `${Math.round((s.ca / displayResults.maxCa) * 100)}%`,
                        transitionTimingFunction: "var(--ease-out)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Annual strip */}
          <div className="mb-16 flex items-center justify-between rounded-xl border border-accent-pink/15 bg-accent-pink/5 px-5 py-3">
            <span className="text-[13px] font-light text-text-secondary">
              Projection sur <span className="font-medium text-text-primary">12 mois</span> -- scenario realiste
            </span>
            <span className="text-[length:var(--text-body-lg)] font-bold tracking-tight text-accent-pink-light">
              {eur(displayResults.annual)}
            </span>
          </div>
        </div>

        {/* Locked overlay quand pas de secteur */}
        {!results && (
          <>
            {/* Gradient overlay rose (comme SEO Sémantique locked) */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl border border-border-subtle"
              style={{
                background:
                  "linear-gradient(180deg, var(--bg-card) 0%, rgba(236,77,203,0.2) 100%)",
              }}
            />
            {/* Empty state centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center rounded-2xl border border-border-subtle bg-bg-overlay/85 px-8 py-8 text-center shadow-xl backdrop-blur-xl">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-accent-pink/15 bg-accent-pink/10">
                  <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </div>
                <p className="text-[length:var(--text-body)] font-medium text-text-secondary">
                  Aucun secteur sélectionné
                </p>
                <p className="mt-1 text-[12px] font-light text-text-muted">
                  Choisissez un secteur d&apos;activité pour afficher les projections.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
