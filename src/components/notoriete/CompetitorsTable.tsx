"use client";

import { CompetitorRow } from "./data";

interface Props {
  rows: CompetitorRow[];
  clientName: string;
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

function ScoreBadge({ score }: { score: number }) {
  const tier =
    score >= 75
      ? { bg: "rgba(52,211,153,0.15)", text: "text-success" }
      : score >= 50
        ? { bg: "rgba(251,146,60,0.15)", text: "text-warning" }
        : { bg: "rgba(239,68,68,0.15)", text: "text-danger" };
  return (
    <span
      className={`inline-block min-w-[44px] rounded-full px-3 py-1 text-center text-[13px] font-semibold tabular-nums ${tier.text}`}
      style={{ background: tier.bg }}
    >
      {score}
    </span>
  );
}

export default function CompetitorsTable({ rows, clientName }: Props) {
  return (
    <section
      className="rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-text-primary/80">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </span>
          <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
            Benchmark concurrents
          </span>
        </div>
        <span className="text-[12px] font-light text-text-muted">Données 12 mois</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="border-b border-border-subtle px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Entreprise
              </th>
              <th className="border-b border-border-subtle px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Backlinks
              </th>
              <th className="border-b border-border-subtle px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Médias
              </th>
              <th className="border-b border-border-subtle px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Présence principale
              </th>
              <th className="border-b border-border-subtle px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isYou = row.isYou;
              return (
                <tr
                  key={row.name}
                  className={isYou ? "relative" : ""}
                  style={
                    isYou
                      ? {
                          background: "rgba(236,77,203,0.08)",
                          boxShadow: "inset 3px 0 0 var(--accent-pink)",
                        }
                      : undefined
                  }
                >
                  <td className={`border-b border-border-subtle px-3 py-4 text-[14px] ${isYou ? "font-semibold text-text-primary" : "font-semibold text-text-primary"}`}>
                    {isYou ? clientName : row.name}
                  </td>
                  <td className={`border-b border-border-subtle px-3 py-4 text-right text-[14px] tabular-nums ${isYou ? "font-semibold text-text-primary" : "text-text-secondary"}`}>
                    {fmt(row.backlinks)}
                  </td>
                  <td className={`border-b border-border-subtle px-3 py-4 text-right text-[14px] tabular-nums ${isYou ? "font-semibold text-text-primary" : "text-text-secondary"}`}>
                    {row.medias}
                  </td>
                  <td className="border-b border-border-subtle px-3 py-4 text-[13px] font-light text-text-muted">
                    {row.presence}
                  </td>
                  <td className="border-b border-border-subtle px-3 py-4 text-right">
                    <ScoreBadge score={row.score} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
