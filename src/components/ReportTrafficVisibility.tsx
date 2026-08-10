"use client";

import { useState } from "react";
import { TrafficChart } from "./PageSpeedCard";
import InsightNote from "./InsightNote";

// Trafic mensuel + Indice de visibilité pour la vue PROSPECT /report (lecture seule,
// données statiques du rapport partagé). MÊME chart que le dashboard (TrafficChart VF),
// sans fetch ni polling : le token a déjà fourni les données. Parité écran interne.

export interface ReportTrafficPoint {
  date: string;
  org_traffic: number;
}
export interface ReportVisibilityPoint {
  month: string;
  visibility: number;
}
export interface ReportPositionsPoint {
  month: string;
  top3?: number | null;
  top10?: number | null;
  top50?: number | null;
}

const TABS = [
  { key: "traffic", label: "Trafic mensuel" },
  { key: "visibility", label: "Indice de visibilité" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const MONTHS_FR = ["", "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
function monthLabelFromIso(iso: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(iso ?? "");
  if (!m) return iso ?? "";
  return `${MONTHS_FR[parseInt(m[2], 10)] ?? m[2]} ${m[1].slice(2)}`;
}

function Msg({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-[13px] font-light leading-relaxed text-text-secondary">{children}</p>;
}

export default function ReportTrafficVisibility({
  traffic,
  visibility,
  positions,
}: {
  traffic: ReportTrafficPoint[];
  visibility: ReportVisibilityPoint[];
  positions: ReportPositionsPoint[];
}) {
  const hasTraffic = traffic.length >= 2;
  const hasVisibility = visibility.length >= 2;
  // Onglet d'ouverture : le premier qui a des données (trafic prioritaire).
  const [tab, setTab] = useState<TabKey>(hasTraffic ? "traffic" : "visibility");

  const rows = [
    { label: "Top 3", data: positions.map((p) => p.top3 ?? 0) },
    { label: "Top 10", data: positions.map((p) => p.top10 ?? 0) },
    { label: "Top 50", data: positions.map((p) => p.top50 ?? 0) },
  ];

  return (
    <section className="rounded-2xl border border-border-subtle bg-bg-card">
      <div className="flex flex-wrap items-center gap-1.5 p-2.5 md:px-4 md:py-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
              tab === t.key ? "bg-accent-pink/[0.12] text-accent-pink" : "text-text-muted hover:text-text-primary"
            }`}
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="border-t border-border-subtle px-4 pb-4 pt-3 md:px-5">
        {tab === "traffic" ? (
          hasTraffic ? (
            <>
              <TrafficChart
                values={traffic.map((p) => p.org_traffic)}
                months={traffic.map((p) => monthLabelFromIso(p.date))}
                showPositions={false}
              />
              <InsightNote className="mt-3">
                Le <span className="font-medium text-text-primary">trafic mensuel</span> correspond aux visites organiques
                estimées (monde) sur les {traffic.length} derniers mois relevés.
              </InsightNote>
            </>
          ) : (
            <Msg>Historique de trafic (monde) pas encore disponible pour ce domaine.</Msg>
          )
        ) : hasVisibility ? (
          <>
            <TrafficChart
              values={visibility.map((p) => p.visibility)}
              months={visibility.map((p) => monthLabelFromIso(p.month))}
              rows={rows}
              showPositions={positions.length > 0}
            />
            <InsightNote className="mt-3">
              L&apos;<span className="font-medium text-text-primary">indice de visibilité</span> reflète la part de clics
              potentiels captée sur l&apos;ensemble de vos mots-clés suivis. Le tableau détaille vos positions top 3 à 50.
            </InsightNote>
          </>
        ) : (
          <Msg>Historique de visibilité pas encore disponible pour ce domaine.</Msg>
        )}
      </div>
    </section>
  );
}
