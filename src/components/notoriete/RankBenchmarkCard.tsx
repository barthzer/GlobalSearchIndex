"use client";

import { useEffect, useState } from "react";

interface Props {
  rank: number;
  total: number;
  hint: string;
  locked?: boolean;
  onUnlockClick?: () => void;
  delay?: number;
}

const headerIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

export default function RankBenchmarkCard({
  rank,
  total,
  hint,
  locked = false,
  onUnlockClick,
  delay = 0,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const animStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition:
      "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo), border-color 300ms var(--ease-out), background-color 300ms var(--ease-out)",
  };

  if (locked) {
    return (
      <div
        className="group relative min-h-[260px] rounded-2xl border border-border-subtle backdrop-blur-[6px]"
        style={animStyle}
      >
        <div
          className="flex h-full min-h-[260px] flex-col items-center justify-between rounded-[calc(1rem-1px)] p-5 md:p-6"
          style={{ background: "linear-gradient(180deg, var(--bg-card) 0%, rgba(238,86,206,0.18) 100%)" }}
        >
          <div className="mb-4 flex w-full items-center gap-2">
            <span className="text-text-primary/80">{headerIcon}</span>
            <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
              Position benchmark
            </span>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center gap-4 py-4">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6817F8]/20 to-[#EE56CE]/20">
              <svg className="h-5 w-5 text-[#EE56CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <button
              onClick={onUnlockClick}
              className="relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent-purple via-accent-pink via-[47%] to-accent-pink-light px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              Débloquer ma position
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative flex min-h-[260px] flex-col items-center justify-between rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] transition-all duration-300 hover:bg-bg-card-hover md:p-6"
      style={{ transitionTimingFunction: "var(--ease-out)", ...animStyle }}
    >
      <div className="mb-4 flex w-full items-center gap-2">
        <span className="text-text-primary/80">{headerIcon}</span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
          Position benchmark
        </span>
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2 text-center">
        <div className="flex items-baseline">
          <span className="text-[44px] font-bold leading-none tracking-tight text-text-primary tabular-nums">
            {rank}
          </span>
          <span className="ml-1 text-sm font-semibold text-text-muted">/ {total}</span>
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Rang concurrentiel
        </div>
        <p className="mt-2 max-w-[200px] text-[12px] font-light leading-snug text-text-secondary">
          {hint}
        </p>
      </div>
    </div>
  );
}
