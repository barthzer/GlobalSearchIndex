"use client";

import NotorieteCard from "./NotorieteCard";

interface Props {
  data: {
    mediasCount: number;
    articlesCount: number;
    pills: string[];
  };
  delay?: number;
}

const icon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
  </svg>
);

export default function MajorMediaCard({ data, delay = 0 }: Props) {
  return (
    <NotorieteCard label="Grands médias" icon={icon} delay={delay}>
      <div className="grid w-full grid-cols-2 gap-x-5 mb-3">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Médias majeurs
          </div>
          <div className="text-[20px] font-bold tracking-tight tabular-nums text-text-primary">
            {data.mediasCount}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Articles
          </div>
          <div className="text-[20px] font-bold tracking-tight tabular-nums text-text-primary">
            {data.articlesCount}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-wrap gap-1.5">
        {data.pills.map((p) => (
          <span
            key={p}
            className="rounded-lg border border-card-inner-border bg-card-inner-bg px-2.5 py-1.5 text-[11px] font-semibold text-text-secondary"
          >
            {p}
          </span>
        ))}
      </div>
    </NotorieteCard>
  );
}
