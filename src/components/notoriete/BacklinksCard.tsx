"use client";

import NotorieteCard from "./NotorieteCard";

interface BacklinksData {
  total: number;
  medias: number;
  domains: number;
  growth: string;
}

interface Props {
  data: BacklinksData;
  delay?: number;
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

const icon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
  </svg>
);

export default function BacklinksCard({ data, delay = 0 }: Props) {
  return (
    <NotorieteCard label="Backlinks" icon={icon} delay={delay}>
      <div className="flex w-full flex-1 flex-col justify-center gap-5">
        {/* Total + évolution */}
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Total
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-[32px] font-bold leading-none tracking-tight tabular-nums text-text-primary">
              {fmt(data.total)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[12px] font-bold text-success">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
              </svg>
              {data.growth}
            </span>
          </div>
          <div className="mt-1 text-[11px] font-light text-text-muted">
            depuis le mois dernier
          </div>
        </div>

        {/* Mini metrics secondaires */}
        <div className="grid grid-cols-2 gap-x-5 border-t border-border-subtle pt-4">
          <SubMetric label="Médias" value={fmt(data.medias)} />
          <SubMetric label="Domaines" value={fmt(data.domains)} />
        </div>
      </div>
    </NotorieteCard>
  );
}

function SubMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="text-[16px] font-bold tracking-tight tabular-nums text-text-primary">
        {value}
      </div>
    </div>
  );
}
