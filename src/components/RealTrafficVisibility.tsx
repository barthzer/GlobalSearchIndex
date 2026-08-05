"use client";

// Bloc Trafic / Visibilité — DEUX sous-onglets de la maquette Barth (TrafficCard) :
//  • « Trafic mensuel »      = org_traffic MONDE (geo_citations.traffic_curve, Ahrefs)
//  • « Indice de visibilité » = visibilité Haloscan (GET /projects/:id/visibility),
//    + tableau des positions (top 3/10/50). PORTABLE maintenant (zéro Ahrefs).
//
// Le COMEX attendait l'indice Haloscan « comme avant » : il vit ici. Le trafic
// reste en état honnête tant qu'Ahrefs n'est pas rechargé. Composant chart = celui
// de Barth (TrafficChart), données RÉELLES.

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { TrafficChart } from "./PageSpeedCard";
import InsightNote from "./InsightNote";
import { fetchProjectScores, type ProjectScore } from "@/lib/scores";

interface TrafficPoint {
  date: string;
  org_traffic: number;
}
interface VisibilityPoint {
  month: string;
  visibility: number;
}
interface PositionsPoint {
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

function Shell({ tab, setTab, children }: { tab: TabKey; setTab: (t: TabKey) => void; children: React.ReactNode }) {
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
      <div className="border-t border-border-subtle px-4 pb-4 pt-3 md:px-5">{children}</div>
    </section>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-[13px] font-light leading-relaxed text-text-secondary">{children}</p>;
}

export default function RealTrafficVisibility({
  projectId,
  score: scoreProp,
}: {
  projectId: string;
  /** Score geo_citations (traffic_curve MONDE). Optionnel : self-fetch si absent
   *  (utilisé tel quel dans la Vue d'ensemble, sans scores parents). */
  score?: ProjectScore | null;
}) {
  const [tab, setTab] = useState<TabKey>("visibility");
  const [vis, setVis] = useState<{ visibility_history: VisibilityPoint[]; positions_history: PositionsPoint[] } | null | "error">(null);
  const [selfScore, setSelfScore] = useState<ProjectScore | null>(null);
  const score = scoreProp ?? selfScore;

  // Visibilité Haloscan — endpoint authentifié, best-effort (comme /report).
  useEffect(() => {
    let active = true;
    apiFetch(`/projects/${projectId}/visibility`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => active && setVis(d))
      .catch(() => active && setVis("error"));
    return () => {
      active = false;
    };
  }, [projectId]);

  // Self-fetch du score geo_citations si le parent ne le passe pas (Vue d'ensemble).
  useEffect(() => {
    if (scoreProp !== undefined) return;
    let active = true;
    fetchProjectScores(projectId)
      .then((s) => active && setSelfScore(s.find((x) => x.scoreType === "geo_citations") ?? null))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [projectId, scoreProp]);

  // ── Onglet Trafic mensuel (org_traffic MONDE) ────────────────────────────
  function TrafficPanel() {
    const status = score?.status ?? null;
    const raw = score?.rawData ?? null;
    if (status == null || status === "locked")
      return <Msg>La courbe de trafic organique (monde) est collectée avec l&apos;analyse concurrentielle. Débloquez-la pour la visualiser.</Msg>;
    if (status === "processing" || status === "pending") return <Msg>Courbe de trafic (monde) en cours de collecte…</Msg>;
    if (status === "error") return <Msg>La courbe de trafic (monde) n&apos;a pas pu être collectée.</Msg>;
    const curve = (raw?.traffic_curve ?? null) as TrafficPoint[] | null;
    if (curve == null) return <Msg>La courbe de trafic (monde) n&apos;a pas pu être mesurée pour ce domaine.</Msg>;
    if (curve.length < 2) return <Msg>Historique de trafic (monde) insuffisant pour tracer une courbe.</Msg>;
    return (
      <>
        <TrafficChart values={curve.map((p) => p.org_traffic)} months={curve.map((p) => monthLabelFromIso(p.date))} showPositions={false} />
        <InsightNote className="mt-3">
          Le <span className="font-medium text-text-primary">trafic mensuel</span> correspond aux visites organiques
          estimées (monde) sur les {curve.length} derniers mois relevés.
        </InsightNote>
      </>
    );
  }

  // ── Onglet Indice de visibilité (Haloscan) ───────────────────────────────
  function VisibilityPanel() {
    if (vis === null) return <div className="h-40 animate-pulse rounded-xl bg-white/[0.04]" />;
    if (vis === "error") return <Msg>L&apos;indice de visibilité n&apos;a pas pu être chargé. Réessayez.</Msg>;
    const hist = vis.visibility_history ?? [];
    const positions = vis.positions_history ?? [];
    if (hist.length < 2)
      return <Msg>Historique de visibilité pas encore disponible pour ce domaine.</Msg>;
    const rows = [
      { label: "Top 3", data: positions.map((p) => p.top3 ?? 0) },
      { label: "Top 10", data: positions.map((p) => p.top10 ?? 0) },
      { label: "Top 50", data: positions.map((p) => p.top50 ?? 0) },
    ];
    return (
      <>
        <TrafficChart
          values={hist.map((p) => p.visibility)}
          months={hist.map((p) => monthLabelFromIso(p.month))}
          rows={rows}
          showPositions={positions.length > 0}
        />
        <InsightNote className="mt-3">
          L&apos;<span className="font-medium text-text-primary">indice de visibilité</span> reflète la part de clics
          potentiels captée sur l&apos;ensemble de vos mots-clés suivis. Le tableau détaille vos positions top 3 à 50.
        </InsightNote>
      </>
    );
  }

  return (
    <Shell tab={tab} setTab={setTab}>
      {tab === "traffic" ? <TrafficPanel /> : <VisibilityPanel />}
    </Shell>
  );
}
