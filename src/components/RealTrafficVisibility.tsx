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
import SemanticUnlockModal from "./SemanticUnlockModal";
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

// État « en cours de calcul » : un cercle qui tourne + un texte rassurant (le score
// arrive). Remplace les messages qui faisaient penser à un bug (retour Alexis 2026-08-07).
function Loading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-accent-pink/30 border-t-accent-pink" />
      <p className="text-[13px] font-light leading-relaxed text-text-secondary">{children}</p>
    </div>
  );
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
  // Statut du score visibility (pour distinguer « en cours » d'un vrai « terminé sans
  // données »). 'unknown' tant qu'on n'a pas encore lu les scores.
  const [visStatus, setVisStatus] = useState<string | null | "unknown">("unknown");
  // Poll actif → on montre un spinner (Haloscan/Ahrefs calculent), jamais un message
  // d'erreur transitoire.
  const [polling, setPolling] = useState(true);
  // Cadenas de l'onglet Trafic : le déblocage concurrence/sémantique collecte la
  // courbe (geo_citations processé avec trafficCurve=true). Après submit → reload.
  const [showUnlock, setShowUnlock] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const score = scoreProp ?? selfScore;

  // Fetch groupé (statuts des scores + données de visibilité) avec POLLING tant que
  // la visibilité (Haloscan) ou le trafic (Ahrefs) sont en cours de calcul. Un échec
  // HTTP transitoire ne bascule PAS en erreur : le poll retente (spinner). Cap de
  // sécurité pour ne pas poller à l'infini (retour Alexis 2026-08-07).
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const MAX_ATTEMPTS = 20; // ~80 s

    async function tick() {
      attempts += 1;
      let vStatus: string | null = null;
      let geoInProgress = false;
      // 1. Statuts des scores (visibility + geo_citations).
      try {
        const all = await fetchProjectScores(projectId);
        if (!active) return;
        const v = all.find((x) => x.scoreType === "visibility") ?? null;
        const geo = all.find((x) => x.scoreType === "geo_citations") ?? null;
        vStatus = v?.status ?? null;
        setVisStatus(vStatus);
        if (scoreProp === undefined) setSelfScore(geo);
        geoInProgress = geo?.status === "processing" || geo?.status === "pending";
      } catch {
        /* réseau : on retentera au prochain tick */
      }
      // 2. Données de visibilité (best-effort : un échec ne fait pas « error »).
      try {
        const r = await apiFetch(`/projects/${projectId}/visibility`);
        if (!active) return;
        if (r.ok) setVis(await r.json());
      } catch {
        /* transitoire : le poll retente */
      }
      // 3. Re-poll tant qu'un calcul est en cours (visibility absente/processing OU
      //    trafic geo en cours), sous le cap.
      const visInProgress =
        vStatus === "processing" || vStatus === "pending" || vStatus == null;
      if (active && (visInProgress || geoInProgress) && attempts < MAX_ATTEMPTS) {
        timer = setTimeout(tick, 4000);
      } else if (active) {
        setPolling(false);
      }
    }

    setVis(null);
    setVisStatus("unknown");
    setPolling(true);
    tick();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [projectId, scoreProp, reloadNonce]);

  // ── Onglet Trafic mensuel (org_traffic MONDE) ────────────────────────────
  function TrafficPanel() {
    const status = score?.status ?? null;
    const raw = score?.rawData ?? null;
    if (status == null || status === "locked")
      return (
        <div className="flex flex-col items-center gap-4 px-6 py-8 text-center md:py-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-pink/10 text-accent-pink">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </span>
          <div className="max-w-md">
            <h3 className="text-[16px] font-semibold text-text-heading">
              Votre courbe de trafic se débloque avec l&apos;analyse concurrentielle
            </h3>
            <p className="mt-1.5 text-[13px] font-light leading-relaxed text-text-secondary">
              La courbe de trafic organique (monde) est collectée en même temps que votre analyse
              concurrentielle. Débloquez-la pour la visualiser.
            </p>
          </div>
          <button
            onClick={() => setShowUnlock(true)}
            className="rounded-full bg-accent-pink px-5 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Débloquer ma courbe de trafic
          </button>
        </div>
      );
    // En cours de collecte → un cercle qui tourne (le score arrive), jamais un message alarmant.
    if (status === "processing" || status === "pending")
      return <Loading>Collecte de la courbe de trafic en cours…</Loading>;
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
    const hist = vis && vis !== "error" ? (vis.visibility_history ?? []) : [];
    const positions = vis && vis !== "error" ? (vis.positions_history ?? []) : [];
    // Pas (encore) de courbe : distinguer « en cours » d'un vrai « terminé sans données ».
    if (hist.length < 2) {
      // Haloscan calcule (ou premier chargement) → un cercle qui tourne, jamais un
      // message qui laisse penser à un bug.
      if (
        polling ||
        visStatus === "unknown" ||
        visStatus === "processing" ||
        visStatus === "pending" ||
        visStatus == null
      )
        return <Loading>Calcul de votre indice de visibilité en cours…</Loading>;
      // Vrai échec terminal (score en erreur).
      if (visStatus === "error")
        return <Msg>L&apos;indice de visibilité n&apos;a pas pu être chargé. Réessayez.</Msg>;
      // Terminé (completed) mais pas assez d'historique pour ce domaine.
      return <Msg>Historique de visibilité pas encore disponible pour ce domaine.</Msg>;
    }
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
    <>
      {showUnlock && (
        <SemanticUnlockModal
          projectId={projectId}
          onClose={() => setShowUnlock(false)}
          onSubmit={() => {
            setShowUnlock(false);
            setReloadNonce((n) => n + 1);
          }}
        />
      )}
      <Shell tab={tab} setTab={setTab}>
        {tab === "traffic" ? <TrafficPanel /> : <VisibilityPanel />}
      </Shell>
    </>
  );
}
