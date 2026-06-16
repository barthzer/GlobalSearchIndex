"use client";

import { useEffect, useState } from "react";
import { useGeneration } from "./GenerationProvider";
import ConcurrentSetupModal from "./ConcurrentSetupModal";
import CompetitorBadge from "./concurrence/CompetitorBadge";
import CoverageHeatmap from "./concurrence/CoverageHeatmap";
import CoverageBars from "./concurrence/CoverageBars";
import ShareOfVoiceDonut from "./concurrence/ShareOfVoiceDonut";
import RankTrophy from "./RankTrophy";
import ExpertCtaBanner from "./ExpertCtaBanner";
import { getSemanticInputs } from "@/lib/semanticInputs";
import { Brand, ConcurrenceData, Keyword, generateCoverageInsight, coverageRate, trafficByBrand } from "./concurrence/types";

type CoverageView = "heatmap" | "bars";

// Dégradé du rose AWI (Uplify) vers le violet bleuté pour les concurrents
const competitorPalette = [
  {
    gradient: "linear-gradient(135deg, #c93dd9, #d566e1)",
    color: "#c93dd9",
    fillColor: "rgba(201,61,217,0.2)",
  },
  {
    gradient: "linear-gradient(135deg, #a72ce8, #b958ee)",
    color: "#a72ce8",
    fillColor: "rgba(167,44,232,0.2)",
  },
  {
    gradient: "linear-gradient(135deg, #6b1afa, #8748fb)",
    color: "#6b1afa",
    fillColor: "rgba(107,26,250,0.2)",
  },
];

function buildBrands(
  mainName: string,
  mainInitial: string,
  competitorNames: string[],
  logos: Record<string, string>
): Brand[] {
  const main: Brand = {
    id: "main",
    name: mainName,
    initial: mainInitial,
    gradient: "linear-gradient(135deg, var(--accent-purple), var(--accent-pink))",
    color: "var(--accent-pink)",
    fillColor: "rgba(236,77,203,0.2)",
    logoUrl: logos["main"],
  };
  const competitors: Brand[] = competitorNames.map((url, i) => {
    const cleanName = url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    const palette = competitorPalette[i % competitorPalette.length];
    const id = `comp${i + 1}`;
    return {
      id,
      name: cleanName || `Concurrent ${i + 1}`,
      initial: (cleanName.charAt(0) || "C").toUpperCase(),
      ...palette,
      logoUrl: logos[id],
    };
  });
  return [main, ...competitors];
}

function buildKeywords(labels: string[]): Keyword[] {
  // Mocked volumes — descending so first KW is most important
  const baseVolumes = [12000, 8500, 5400, 3200, 1800, 1200, 950, 720, 540, 380];
  return labels.map((label, i) => ({
    label,
    volume: baseVolumes[i] ?? 250,
  }));
}

// Mocked SERP positions — rows = keywords, columns = brands (main first)
function buildPositions(brandsCount: number, keywordsCount: number): (number | null)[][] {
  const seedMatrix: (number | null)[][] = [
    [3, 8, 12, 18],
    [9, 15, 7, 2],
    [6, 22, 4, 28],
    [11, 10, 15, 5],
    [8, 5, 20, 13],
    [4, 12, 9, 25],
    [7, 18, null, 6],
    [10, 3, 14, 19],
    [12, 6, 22, 8],
    [5, 11, 16, 30],
  ];
  return Array.from({ length: keywordsCount }).map((_, kIdx) => {
    const row = seedMatrix[kIdx % seedMatrix.length];
    return Array.from({ length: brandsCount }).map((__, bIdx) => row[bIdx % row.length]);
  });
}

const coverageTabs: { id: CoverageView; label: string; icon: React.ReactNode }[] = [
  {
    id: "heatmap",
    label: "Heatmap",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    id: "bars",
    label: "Barres",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
];

/** Bascule heatmap / barres — 2 icônes en haut à droite du bloc. */
function CoverageSwitch({ view, onChange }: { view: CoverageView; onChange: (v: CoverageView) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border-subtle bg-card-inner-bg p-1">
      {coverageTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          title={tab.label}
          aria-label={tab.label}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
            view === tab.id ? "bg-bg-card text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"
          }`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );
}

/** Calcule le rang du client (id "main") combinant couverture top 10 + part de voix. */
function computeRanking(data: ConcurrenceData) {
  const { brands, keywords, positions } = data;
  const traffic = trafficByBrand(positions, keywords);
  const totalTraffic = traffic.reduce((s, t) => s + t, 0) || 1;
  const scores = brands.map((_, bIdx) => {
    const cov = coverageRate(positions.map((row) => row[bIdx]));
    const sov = (traffic[bIdx] / totalTraffic) * 100;
    return cov * 0.5 + sov * 0.5;
  });
  const order = brands.map((b, i) => ({ id: b.id, name: b.name, score: scores[i] })).sort((a, b) => b.score - a.score);
  const mainRank = order.findIndex((o) => o.id === "main") + 1;
  const leader = order[0];
  return { rank: mainRank, total: brands.length, leaderName: leader.name, isLeader: leader.id === "main" };
}

/** Phrase de synthèse globale (couverture + part de voix réunies). */
function globalInsight(data: ConcurrenceData): string {
  const { brands } = data;
  const { rank, total, leaderName, isLeader } = computeRanking(data);
  const you = brands.find((b) => b.id === "main")?.name ?? "Votre marque";
  if (isLeader) {
    return `${you} se classe 1ʳᵉ sur ${total} en combinant couverture top 10 et part de voix. Maintenez l'avance en consolidant les mots-clés à fort volume où vous êtes déjà bien positionné.`;
  }
  return `Sur l'ensemble couverture top 10 + part de voix, ${you} se classe ${rank}ᵉ sur ${total}, derrière ${leaderName}. La priorité : gagner des positions sur les mots-clés à fort volume encore hors du top 10.`;
}

export default function ConcurrenceView({ onExpertClick }: { onExpertClick?: () => void }) {
  const { selected: currentGeneration } = useGeneration();
  const storageKey = `concurrence-${currentGeneration.id}`;

  const [configured, setConfigured] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [coverageView, setCoverageView] = useState<CoverageView>("heatmap");
  const [logos, setLogos] = useState<Record<string, string>>({});

  // Restore state from localStorage on mount / generation change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.competitors?.length && parsed.keywords?.length) {
          setCompetitors(parsed.competitors);
          setKeywords(parsed.keywords);
          setLogos(parsed.logos ?? {});
          setConfigured(true);
          return;
        }
      }
    } catch {}
    // Linked : concurrents/mots-clés déjà saisis dans la modale SEO sémantique (vue analyse).
    const sem = getSemanticInputs();
    if (sem.competitors.length && sem.keywords.length) {
      setCompetitors(sem.competitors);
      setKeywords(sem.keywords);
      setLogos({});
      setConfigured(true);
      return;
    }
    setConfigured(false);
    setCompetitors([]);
    setKeywords([]);
    setLogos({});
  }, [storageKey]);

  function persistState(next: { competitors: string[]; keywords: string[]; logos: Record<string, string> }) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  }

  function handleSubmit(comps: string[], kws: string[]) {
    setCompetitors(comps);
    setKeywords(kws);
    setConfigured(true);
    setShowSetup(false);
    persistState({ competitors: comps, keywords: kws, logos });
  }

  function handleLogoChange(brandId: string, dataUrl: string) {
    const nextLogos = { ...logos, [brandId]: dataUrl };
    setLogos(nextLogos);
    persistState({ competitors, keywords, logos: nextLogos });
  }

  const data: ConcurrenceData | null = configured
    ? (() => {
        const brands = buildBrands(
          currentGeneration.name,
          currentGeneration.initial,
          competitors,
          logos
        );
        const keywordsData = buildKeywords(keywords);
        const positions = buildPositions(brands.length, keywordsData.length);
        return { brands, keywords: keywordsData, positions };
      })()
    : null;

  return (
    <div className="animate-fade-up pb-16">
      {showSetup && (
        <ConcurrentSetupModal
          initialCompetitors={competitors.length ? competitors : undefined}
          initialKeywords={keywords.length ? keywords : undefined}
          onClose={() => setShowSetup(false)}
          onSubmit={handleSubmit}
        />
      )}

      {!configured || !data ? (
        // Empty state
        <div className="flex flex-col items-center rounded-2xl border border-border-subtle bg-bg-card py-16 text-center backdrop-blur-[6px]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <h2 className="mb-2 text-[length:var(--text-body-lg)] font-medium text-text-primary">
            Configurer votre analyse concurrentielle
          </h2>
          <p className="mb-6 max-w-md text-[length:var(--text-body)] font-light leading-relaxed text-text-secondary">
            Renseignez vos concurrents et vos mots-clés stratégiques pour comparer votre couverture et votre part de voix dans les résultats de recherche.
          </p>
          <button
            onClick={() => setShowSetup(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent-purple via-accent-pink via-[47%] to-accent-pink-light px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-accent-pink/20 active:scale-[0.97]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Configurer l&apos;analyse
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          {/* Competitors row (excludes main brand — already in header above) */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Concurrents
            </span>
            {data.brands
              .filter((b) => b.id !== "main")
              .map((b) => (
                <CompetitorBadge key={b.id} brand={b} onLogoChange={handleLogoChange} />
              ))}
            <button
              onClick={() => setShowSetup(true)}
              className="ml-auto flex items-center gap-1.5 rounded-full border border-border-subtle bg-card-inner-bg px-4 py-2 text-[13px] font-medium text-text-muted transition-all duration-200 hover:border-border-badge hover:bg-bg-card-hover hover:text-text-primary active:scale-[0.95]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
              Modifier
            </button>
          </div>

          {/* Coverage section */}
          <section className="mb-6 rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]">
            <div className="flex items-center justify-between gap-3 px-5 pt-5 md:px-6">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M3.75 13.5h6v6h-6v-6Zm0-9h6v6h-6v-6Zm10.5 0h6v6h-6v-6Zm0 10.5h6v3.75h-6v-3.75Z" />
                </svg>
                <h3 className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
                  Analyse des mots-clés en top 10
                </h3>
              </div>
              <CoverageSwitch view={coverageView} onChange={setCoverageView} />
            </div>

            <div
              key={coverageView}
              className="p-5 md:p-6"
              style={{ animation: "fade-up 300ms var(--ease-out) both" }}
            >
              {coverageView === "heatmap" && <CoverageHeatmap data={data} />}
              {coverageView === "bars" && <CoverageBars data={data} />}

              {(() => {
                const insight = generateCoverageInsight(data);
                if (!insight) return null;
                return (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-4 py-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
                    </svg>
                    <p className="text-[length:var(--text-body)] font-light leading-relaxed text-text-primary">
                      {insight}
                    </p>
                  </div>
                );
              })()}
            </div>
          </section>

          {/* Share of Voice section */}
          <section className="rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]">
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4 md:px-6">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
                <h3 className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
                  Share of Voice
                </h3>
              </div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Pondéré par CTR × volume
              </span>
            </div>
            <div className="p-5 md:p-6">
              <ShareOfVoiceDonut data={data} />
            </div>
          </section>

          {/* Classement global + synthèse */}
          {(() => {
            const { rank, total } = computeRanking(data);
            return (
              <section className="mt-6 rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                  </svg>
                  <h3 className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Classement global</h3>
                </div>

                <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
                  <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border-subtle bg-card-inner-bg px-6 py-4">
                    <RankTrophy rank={rank} size={40} />
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tabular-nums text-text-primary">{rank}</span>
                      <span className="text-lg font-medium text-text-muted">/ {total}</span>
                    </div>
                  </div>
                  <div className="flex flex-1 items-start gap-3 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-4 py-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
                    </svg>
                    <p className="text-[length:var(--text-body)] font-light leading-relaxed text-text-primary">
                      {globalInsight(data)}
                    </p>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* CTA expert — bannière pleine largeur */}
          {onExpertClick && <ExpertCtaBanner onExpertClick={onExpertClick} className="mt-6" />}
        </>
      )}
    </div>
  );
}

export function CoverageSection() {
  const { selected: currentGeneration } = useGeneration();
  const storageKey = `concurrence-${currentGeneration.id}`;
  const [configured, setConfigured] = useState(false);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [coverageView, setCoverageView] = useState<CoverageView>("heatmap");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.competitors?.length && parsed.keywords?.length) {
          setCompetitors(parsed.competitors);
          setKeywords(parsed.keywords);
          setLogos(parsed.logos ?? {});
          setConfigured(true);
          return;
        }
      }
    } catch {}
    // Linked : concurrents/mots-clés saisis dans la modale SEO sémantique.
    const sem = getSemanticInputs();
    if (sem.competitors.length && sem.keywords.length) {
      setCompetitors(sem.competitors);
      setKeywords(sem.keywords);
      setConfigured(true);
      return;
    }
    setConfigured(false);
  }, [storageKey]);

  const data: ConcurrenceData | null = configured
    ? (() => {
        const brands = buildBrands(currentGeneration.name, currentGeneration.initial, competitors, logos);
        const keywordsData = buildKeywords(keywords);
        const positions = buildPositions(brands.length, keywordsData.length);
        return { brands, keywords: keywordsData, positions };
      })()
    : null;

  if (!configured || !data) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-border-subtle bg-bg-card py-10 text-center backdrop-blur-[6px]">
        <p className="mb-1 text-[14px] font-medium text-text-primary">Analyse concurrentielle non configurée</p>
        <p className="text-[13px] font-light text-text-secondary">Configurez vos concurrents depuis l&apos;onglet Concurrence.</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 md:px-6">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M3.75 13.5h6v6h-6v-6Zm0-9h6v6h-6v-6Zm10.5 0h6v6h-6v-6Zm0 10.5h6v3.75h-6v-3.75Z" />
          </svg>
          <h3 className="text-[length:var(--text-body-lg)] font-medium text-text-heading">Analyse des mots-clés en top 10</h3>
        </div>
        <CoverageSwitch view={coverageView} onChange={setCoverageView} />
      </div>
      <div key={coverageView} className="p-5 md:p-6" style={{ animation: "fade-up 300ms var(--ease-out) both" }}>
        {coverageView === "heatmap" && <CoverageHeatmap data={data} />}
        {coverageView === "bars" && <CoverageBars data={data} />}
      </div>
    </section>
  );
}
