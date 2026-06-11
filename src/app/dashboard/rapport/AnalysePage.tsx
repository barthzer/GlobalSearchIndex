import type { Generation } from "@/components/GenerationProvider";
import ReportPage from "./ReportPage";
import { analyseScores, pageSpeedScores, performanceStats, globalScore, type PerfTier } from "./scores";

const tierColor: Record<PerfTier, string> = {
  success: "#16a34a",
  warning: "#ea580c",
  danger: "#dc2626",
};

interface Props {
  client: Generation;
}

function ScoreColor(score: number): string {
  if (score < 50) return "#ef4444";
  if (score < 75) return "#f97316";
  return "#22c55e";
}

function HalfArc({ score }: { score: number }) {
  const radius = 60;
  const circ = Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = ScoreColor(score);
  return (
    <svg viewBox="0 0 140 76" className="h-[64px] w-[120px]">
      <path
        d="M8 70 A62 62 0 0 1 132 70"
        fill="none"
        stroke="var(--arc-bg)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d="M8 70 A62 62 0 0 1 132 70"
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function NotAuditedArc() {
  return (
    <div className="relative">
      <svg viewBox="0 0 140 76" className="h-[64px] w-[120px]">
        <path
          d="M8 70 A62 62 0 0 1 132 70"
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="3 6"
        />
      </svg>
      <div className="absolute inset-0 flex items-end justify-center pb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle bg-card-inner-bg">
          <svg className="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function PageSpeedCircle({ score }: { score: number }) {
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = ScoreColor(score);
  return (
    <svg viewBox="0 0 56 56" className="h-12 w-12">
      <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--arc-bg)" strokeWidth={4} />
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 28 28)"
      />
    </svg>
  );
}

export default function AnalysePage({ client }: Props) {
  return (
    <ReportPage pageNumber={2} id="page-analyse">
      <div className="flex h-full flex-col">
        {/* Header */}
        <PageHeader title="Diagnostic SEO & Performance" subtitle="Page 02 · Analyse" client={client} />

        {/* Executive summary */}
        <div className="mt-6 rounded-2xl border border-border-subtle bg-card-inner-bg p-5">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
            </svg>
            <div>
              <span className="text-[11px] font-medium text-text-muted">
                Synthèse exécutive
              </span>
              <p className="mt-2 text-[13px] font-light leading-relaxed text-text-primary">
                <strong className="font-medium">{client.name}</strong> obtient un score global de{" "}
                <strong className="font-medium">{globalScore}/100</strong>. Le SEO Technique est le pilier
                le plus mature ; le GEO et l&apos;Autorité présentent les marges de progression les plus
                immédiates. Trois leviers prioritaires sont identifiés en page suivante.
              </p>
            </div>
          </div>
        </div>

        {/* Scores grid 2x2 */}
        <div className="mt-6">
          <h3 className="mb-4 text-[12px] font-medium text-text-secondary">
            Score par pilier
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {analyseScores.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-card p-5"
              >
                <div>
                  <div className="text-[14px] font-medium text-text-primary">{s.label}</div>
                  {s.score === null ? (
                    <div className="mt-1 text-[11px] font-light italic text-text-muted">{s.note}</div>
                  ) : (
                    <div className="mt-1 text-[11px] font-light text-text-secondary">
                      Score sur 100
                    </div>
                  )}
                </div>
                {s.score === null ? (
                  <NotAuditedArc />
                ) : (
                  <div className="relative">
                    <HalfArc score={s.score} />
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="text-[22px] font-semibold tabular-nums text-text-primary">
                        {s.score}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PageSpeed strip */}
        <div className="mt-5">
          <h3 className="mb-3 text-[12px] font-medium text-text-secondary">
            PageSpeed Insights · Mobile
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {pageSpeedScores.map((p) => (
              <div
                key={p.label}
                className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-card px-4 py-3"
              >
                <PageSpeedCircle score={p.score} />
                <div className="flex flex-col">
                  <span className="text-[18px] font-semibold tabular-nums text-text-primary">
                    {p.score}
                  </span>
                  <span className="text-[11px] font-light text-text-muted">
                    {p.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance du site (Core Web Vitals) */}
        <div className="mt-5">
          <h3 className="mb-3 text-[12px] font-medium text-text-secondary">
            Performance du site
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {performanceStats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col rounded-xl border border-border-subtle bg-bg-card p-3"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] font-semibold text-text-muted">
                    {s.label}
                  </span>
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ background: tierColor[s.tier] }}
                  />
                </div>
                <span
                  className="mt-1 text-[20px] font-semibold leading-tight tabular-nums"
                  style={{ color: tierColor[s.tier] }}
                >
                  {s.value}
                </span>
                <span className="mt-1 text-[9px] font-medium leading-tight text-text-secondary">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-auto pt-5 text-[10px] font-light italic leading-relaxed text-text-muted">
          Méthodologie : scores Lighthouse (Mobile) sur la page d&apos;accueil et les pages stratégiques,
          consolidés avec l&apos;audit technique AWI et l&apos;analyse de l&apos;empreinte GEO sur ChatGPT,
          Gemini et Perplexity.
        </p>
      </div>
    </ReportPage>
  );
}

export function PageHeader({
  title,
  subtitle,
  client,
}: {
  title: string;
  subtitle: string;
  client?: Generation;
}) {
  return (
    <div className="flex items-end justify-between border-b border-border-subtle pb-4">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-muted">
          {subtitle}
        </span>
        <h2 className="mt-1 text-[26px] font-medium leading-tight tracking-tight text-text-primary">
          {title}
        </h2>
      </div>
      {client ? (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-text-secondary">{client.name}</span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${client.color} text-[10px] font-bold text-white shadow-sm`}
          >
            {client.initial}
          </div>
        </div>
      ) : (
        <span className="text-[10px] font-medium text-text-muted">
          Global Search Index
        </span>
      )}
    </div>
  );
}
