"use client";

import CompetitorsTable from "./CompetitorsTable";
import RankTrophy from "../RankTrophy";
import InsightNote from "../InsightNote";
import { CompetitorRow } from "./data";

interface Props {
  rows: CompetitorRow[];
  clientName: string;
  unlocked: boolean;
  onUnlockClick: () => void;
  rank: number;
  total: number;
  rankHint: string;
}

function PositionBlock({ rank, total, hint }: { rank: number; total: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
      {/* Header — même pattern que NotorieteCard */}
      <div className="mb-4 flex w-full items-center gap-2">
        <span className="text-text-primary/80">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
          Position benchmark
        </span>
      </div>

      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-card-inner-bg px-6 py-4">
          <RankTrophy rank={rank} size={40} />
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tabular-nums text-text-primary">{rank}</span>
            <span className="text-lg font-medium text-text-muted">/ {total}</span>
          </div>
        </div>
        <InsightNote className="mt-2 w-full">{hint}</InsightNote>
      </div>
    </div>
  );
}

export default function BenchmarkSection({
  rows,
  clientName,
  unlocked,
  onUnlockClick,
  rank,
  total,
  rankHint,
}: Props) {
  if (unlocked) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5 lg:items-start">
        <PositionBlock rank={rank} total={total} hint={rankHint} />
        <CompetitorsTable rows={rows} clientName={clientName} />
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border-subtle backdrop-blur-[6px]"
      style={{
        background:
          "linear-gradient(180deg, var(--bg-card) 0%, rgba(238,86,206,0.18) 100%)",
      }}
    >
      <div className="flex flex-col items-center px-6 py-12 text-center">
        {/* Icône cadenas */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>

        <h3 className="mb-2 text-[length:var(--text-body-lg)] font-semibold text-text-primary">
          Benchmark concurrents verrouillé
        </h3>
        <p className="mb-6 max-w-md text-[length:var(--text-body)] font-light leading-relaxed text-text-secondary">
          Renseignez vos concurrents pour comparer votre couverture média et débloquer
          l&apos;analyse benchmark sur 12 mois.
        </p>

        <button
          onClick={onUnlockClick}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent-purple via-accent-pink via-[47%] to-accent-pink-light px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          Débloquer mes concurrents
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
