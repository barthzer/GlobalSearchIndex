"use client";

import type { Generation } from "@/components/GenerationProvider";
import type { Brand, ConcurrenceData } from "@/components/concurrence/types";
import { trafficByBrand, coverageRate } from "@/components/concurrence/types";
import CoverageHeatmap from "@/components/concurrence/CoverageHeatmap";
import BrandAvatar from "@/components/concurrence/BrandAvatar";
import ReportPage from "./ReportPage";
import { PageHeader } from "./AnalysePage";

interface Props {
  client: Generation;
}

const competitorPalette = [
  { gradient: "linear-gradient(135deg, #c93dd9, #d566e1)", color: "#c93dd9", fillColor: "rgba(201,61,217,0.2)" },
  { gradient: "linear-gradient(135deg, #a72ce8, #b958ee)", color: "#a72ce8", fillColor: "rgba(167,44,232,0.2)" },
  { gradient: "linear-gradient(135deg, #6b1afa, #8748fb)", color: "#6b1afa", fillColor: "rgba(107,26,250,0.2)" },
];

const competitors = [
  { name: "Pennylane", initial: "P" },
  { name: "Sage France", initial: "S" },
  { name: "Qonto", initial: "Q" },
];

const keywords = [
  { label: "facturation électronique", volume: 12000 },
  { label: "logiciel comptabilité PME", volume: 8500 },
  { label: "ERP finance", volume: 5400 },
  { label: "saas gestion comptable", volume: 3200 },
  { label: "automatisation paie", volume: 1800 },
  { label: "expert comptable digital", volume: 1200 },
  { label: "logiciel facturation auto-entrepreneur", volume: 950 },
  { label: "tableau de bord financier", volume: 720 },
  { label: "gestion trésorerie entreprise", volume: 540 },
  { label: "outil reporting comptable", volume: 380 },
];

// rows = keywords, cols = brands [client, Pennylane, Sage, Qonto]
const positions: (number | null)[][] = [
  [4, 2, 6, 12],
  [9, 3, 5, 18],
  [7, 4, 11, 22],
  [11, 6, 9, 25],
  [5, 8, 14, null],
  [8, 5, 12, 16],
  [13, 7, 18, 28],
  [6, 10, 15, 19],
  [10, 4, 22, null],
  [14, 8, 11, 25],
];

function buildData(client: Generation): ConcurrenceData {
  const main: Brand = {
    id: "main",
    name: client.name,
    initial: client.initial,
    gradient: "linear-gradient(135deg, var(--accent-purple), var(--accent-pink))",
    color: "var(--accent-pink)",
    fillColor: "rgba(236,77,203,0.2)",
  };
  const others: Brand[] = competitors.map((c, i) => ({
    id: `comp${i + 1}`,
    name: c.name,
    initial: c.initial,
    ...competitorPalette[i],
  }));
  return { brands: [main, ...others], keywords, positions };
}

export default function ConcurrencePage({ client }: Props) {
  const data = buildData(client);
  const coverages = data.brands.map((_, bIdx) =>
    coverageRate(data.positions.map((row) => row[bIdx]))
  );
  const traffic = trafficByBrand(data.positions, data.keywords);
  const totalTraffic = traffic.reduce((a, b) => a + b, 0);
  const clientShare = totalTraffic === 0 ? 0 : Math.round((traffic[0] / totalTraffic) * 100);
  const leaderIdx = traffic.indexOf(Math.max(...traffic));
  const leader = data.brands[leaderIdx];
  const leaderShare = totalTraffic === 0 ? 0 : Math.round((traffic[leaderIdx] / totalTraffic) * 100);
  const isLeader = leaderIdx === 0;
  const delta = clientShare - leaderShare;

  return (
    <ReportPage pageNumber={4} id="page-concurrence">
      <div className="flex h-full flex-col">
        <PageHeader title="Positionnement vs concurrents" subtitle="Page 04 · Concurrence" client={client} />

        {/* KPI headline */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border-subtle bg-bg-card p-4">
            <div className="text-[11px] font-medium text-text-muted">
              Votre Share of Voice
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-[34px] font-semibold leading-none tabular-nums text-text-primary">
                {clientShare}
              </span>
              <span className="text-[14px] text-text-muted">%</span>
            </div>
            <div className="mt-1 text-[11px] font-light text-text-secondary">
              {isLeader
                ? "Vous menez la part de voix"
                : `${Math.abs(delta)} pts sous ${leader.name}`}
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-bg-card p-4">
            <div className="text-[11px] font-medium text-text-muted">
              Couverture Top 10
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-[34px] font-semibold leading-none tabular-nums text-text-primary">
                {coverages[0]}
              </span>
              <span className="text-[14px] text-text-muted">%</span>
            </div>
            <div className="mt-1 text-[11px] font-light text-text-secondary">
              des mots-clés stratégiques en page 1
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-bg-card p-4">
            <div className="text-[11px] font-medium text-text-muted">
              Mots-clés analysés
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-[34px] font-semibold leading-none tabular-nums text-text-primary">
                {keywords.length}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-light text-text-secondary">
              vs {competitors.length} concurrents directs
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="mt-4 rounded-2xl border border-border-subtle bg-bg-card p-4">
          <h3 className="mb-3 text-[12px] font-medium text-text-secondary">
            Couverture sur les requêtes stratégiques
          </h3>
          <CoverageHeatmap data={data} compact />
        </div>

        {/* Share of voice — version simplifiée + insight */}
        <div className="mt-3 rounded-2xl border border-border-subtle bg-bg-card p-4">
          <h3 className="mb-3 text-[12px] font-medium text-text-secondary">
            Répartition du Share of Voice
          </h3>
          <SovStatic data={data} traffic={traffic} totalTraffic={totalTraffic} />

          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-3 py-2.5">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
            </svg>
            <p className="text-[11px] font-light leading-relaxed text-text-primary">
              {isLeader
                ? `Vous menez la part de voix avec ${clientShare}% des clics estimés sur les requêtes stratégiques.`
                : `${leader.name} capte ${leaderShare}% du Share of Voice, soit ${Math.abs(delta)} points devant ${client.name} (${clientShare}%). Récupérer une partie de cet écart passe par 2 leviers : améliorer les positions sur les mots-clés à fort volume, et renforcer la couverture top 10 (actuellement ${coverages[0]}%).`}
            </p>
          </div>
        </div>
      </div>
    </ReportPage>
  );
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR");
}

function SovStatic({
  data,
  traffic,
  totalTraffic,
}: {
  data: ConcurrenceData;
  traffic: number[];
  totalTraffic: number;
}) {
  const { brands } = data;
  const shares = traffic.map((t) => (totalTraffic === 0 ? 0 : (t / totalTraffic) * 100));
  const sorted = brands
    .map((b, i) => ({ brand: b, share: shares[i], traffic: traffic[i] }))
    .sort((a, b) => b.share - a.share);

  const size = 130;
  const cx = size / 2;
  const cy = size / 2;
  const r = 52;
  const sw = 10;
  const c = 2 * Math.PI * r;
  const visualGap = 5;
  const gapTotal = visualGap + sw;
  let cumulative = 0;
  const arcs = brands.map((b, i) => {
    const share = shares[i] / 100;
    const fullArcLen = share * c;
    const visibleLen = Math.max(0, fullArcLen - gapTotal);
    const rotation = cumulative * 360 + (gapTotal / c) * 180;
    cumulative += share;
    return { brand: b, visibleLen, rotation };
  });

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {arcs.map((a) => (
            <circle
              key={a.brand.id}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={a.brand.color}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={`${a.visibleLen} ${c - a.visibleLen}`}
              style={{
                transform: `rotate(${a.rotation}deg)`,
                transformOrigin: `${cx}px ${cy}px`,
              }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium text-text-muted">
            Total clics
          </span>
          <span className="mt-0.5 text-[20px] font-semibold tabular-nums text-text-primary">
            {fmt(totalTraffic)}
          </span>
          <span className="text-[10px] font-light text-text-muted">estimés/mois</span>
        </div>
      </div>

      {/* Legend simplifiée */}
      <div className="flex flex-1 flex-col gap-1">
        {sorted.map((row) => (
          <div
            key={row.brand.id}
            className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-card-inner-bg px-2.5 py-1.5"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: row.brand.color }} />
            <BrandAvatar brand={row.brand} size={18} textSize="text-[9px]" />
            <span className="flex-1 truncate text-[11px] font-medium text-text-primary">
              {row.brand.name}
            </span>
            <span className="text-[10px] font-light tabular-nums text-text-muted">
              ~{fmt(row.traffic)} clics
            </span>
            <span
              className="w-12 text-right text-[13px] font-bold tabular-nums"
              style={{ color: row.brand.color }}
            >
              {row.share.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
