import type { Generation } from "@/components/GenerationProvider";
import ReportPage from "./ReportPage";
import { PageHeader } from "./AnalysePage";
import { recommendations, type Pillar, type Priority, type Effort } from "./recommendations";

interface Props {
  client: Generation;
}

const priorityConfig: Record<Priority, { bg: string; border: string; color: string }> = {
  P1: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", color: "#dc2626" },
  P2: { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", color: "#7c3aed" },
  P3: { bg: "rgba(29,78,216,0.1)", border: "rgba(29,78,216,0.3)", color: "#1d4ed8" },
};

const pillarColor: Record<Pillar, string> = {
  "SEO Technique": "#5f14fb",
  "SEO Sémantique": "#7c3aed",
  GEO: "#ec4dcb",
  Autorité: "#0d6fef",
};

const effortDots: Record<Effort, number> = {
  Faible: 1,
  Moyen: 2,
  Élevé: 3,
};

export default function RecommendationsPage({ client }: Props) {
  return (
    <ReportPage pageNumber={3} id="page-recommandations">
      <div className="flex h-full flex-col">
        <PageHeader title="Plan d'action prioritaire" subtitle="Page 03 · Recommandations" client={client} />

        <p className="mt-5 max-w-[150mm] text-[13px] font-light leading-relaxed text-text-secondary">
          Cinq leviers identifiés à l&apos;issue du diagnostic, classés par ordre de priorité et de
          gain estimé. Chaque recommandation est associée à un effort de mise en œuvre.
        </p>

        <ol className="mt-6 flex flex-col gap-3">
          {recommendations.slice(0, 5).map((r, i) => {
            const pri = priorityConfig[r.priority];
            return (
              <li
                key={i}
                className="rounded-2xl border border-border-subtle bg-bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Index */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card-inner-bg text-[12px] font-semibold tabular-nums text-text-secondary">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          background: pri.bg,
                          borderColor: pri.border,
                          color: pri.color,
                        }}
                      >
                        {r.priority} · {r.priority === "P1" ? "Critique" : r.priority === "P2" ? "Important" : "Moyen"}
                      </span>
                      <span
                        className="inline-flex items-center rounded-full border border-border-subtle bg-card-inner-bg px-2 py-0.5 text-[10px] font-medium"
                        style={{ color: pillarColor[r.pillar] }}
                      >
                        {r.pillar}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-card-inner-bg px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                        Effort {r.effort.toLowerCase()}
                        <span className="flex gap-0.5">
                          {[1, 2, 3].map((d) => (
                            <span
                              key={d}
                              className="h-1 w-1 rounded-full"
                              style={{
                                background:
                                  d <= effortDots[r.effort] ? "var(--text-secondary)" : "var(--border-subtle)",
                              }}
                            />
                          ))}
                        </span>
                      </span>
                    </div>

                    {/* Titre = wording marché */}
                    <p className="text-[13px] font-semibold leading-snug text-text-primary">
                      {r.title}
                    </p>

                    {/* Observation technique */}
                    <p className="text-[12px] font-light leading-relaxed text-text-secondary">
                      {r.observation}
                    </p>

                    {/* Action à mener — encart gris */}
                    <div className="flex items-start gap-2 rounded-lg border border-card-inner-border bg-card-inner-bg px-3 py-2">
                      <svg className="mt-[2px] h-3 w-3 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                      <p className="text-[12px] font-light leading-relaxed text-text-primary">
                        {r.action}
                      </p>
                    </div>

                    {/* Gain + accompagnement */}
                    <p className="text-[11px] font-light leading-relaxed text-text-secondary">
                      <span className="font-medium text-text-primary">Gain estimé : </span>
                      {r.gain}
                    </p>
                    <p className="text-[11px] font-light italic leading-relaxed text-text-muted">
                      Comment AWI vous accompagne · {r.awiAngle}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </ReportPage>
  );
}
