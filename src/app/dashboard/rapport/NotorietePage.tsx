import type { Generation } from "@/components/GenerationProvider";
import { authorityScore, backlinksData, majorMediaData, editorialPlan, rankBenchmark, competitorsTable } from "@/components/notoriete/data";
import MediaLogo from "@/components/notoriete/MediaLogo";
import ReportPage from "./ReportPage";
import { PageHeader } from "./AnalysePage";

interface Props {
  client: Generation;
  consultant: string;
}

export default function NotorietePage({ client, consultant }: Props) {
  const leaderRow = competitorsTable.find((c) => !c.isYou) ?? competitorsTable[0];
  const leader = leaderRow.name;
  const leaderScore = leaderRow.score;
  const gap = leaderScore - authorityScore;

  return (
    <ReportPage pageNumber={5} id="page-notoriete">
      <div className="flex h-full flex-col">
        <PageHeader title="Notoriété & autorité média" subtitle="Page 05 · Notoriété" client={client} />

        {/* KPI row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <KPI label="Score d'autorité" value={authorityScore} suffix="/100" />
          <KPI label="Backlinks médias" value={backlinksData.total.toLocaleString("fr-FR")} hint={backlinksData.growth + " sur 12 mois"} />
          <KPI label="Médias majeurs" value={majorMediaData.mediasCount} hint={`${majorMediaData.articlesCount} articles`} />
        </div>

        {/* Major media pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border-subtle bg-card-inner-bg px-4 py-3">
          <span className="text-[11px] font-medium text-text-muted">
            Présence éditoriale
          </span>
          {majorMediaData.pills.map((p) => (
            <span
              key={p}
              className="rounded-full border border-border-subtle bg-bg-card px-2.5 py-1 text-[11px] font-medium text-text-secondary"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Insight stratégique */}
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-3 py-2.5">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
          </svg>
          <p className="text-[11px] font-light leading-relaxed text-text-primary">
            Avec {authorityScore}/100 d&apos;autorité média, {client.name} occupe le {rankBenchmark.rank}<sup>e</sup> rang du secteur ({rankBenchmark.total} acteurs analysés), {gap} points sous {leader} ({leaderScore}/100). {rankBenchmark.hint.replace(/^[^.]*\.\s*/, "")}
          </p>
        </div>

        {/* Editorial calendar */}
        <div className="mt-4">
          <h3 className="mb-2 text-[12px] font-medium text-text-secondary">
            Calendrier éditorial 2026
          </h3>
          <div className="flex flex-col gap-1.5">
            {editorialPlan.map((slot, i) => (
              <article
                key={i}
                className="grid grid-cols-[60px_minmax(0,1fr)_120px] items-center gap-3 rounded-xl border border-border-subtle bg-bg-card px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-text-primary">{slot.month.split(" ")[0]}</span>
                  <span className="text-[10px] font-light text-text-muted">
                    {slot.tag}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-medium text-text-primary">
                    {slot.title}
                  </div>
                  <div className="truncate text-[10px] font-light text-text-secondary">
                    {slot.description}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <MediaLogo mediaLogo={slot.mediaLogo} height={11} color="var(--text-secondary)" />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Signature footer */}
        <div className="mt-auto pt-5">
          <div className="rounded-2xl border border-border-subtle bg-card-inner-bg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/consultant1.png"
                  alt={consultant}
                  className="h-12 w-12 shrink-0 rounded-full border-2 border-bg-card object-cover shadow-sm"
                />
                <div>
                  <div className="text-[11px] font-medium text-text-muted">
                    Pour discuter de ce rapport
                  </div>
                  <div className="mt-0.5 text-[14px] font-medium text-text-primary">{consultant}</div>
                  <div className="text-[12px] font-light text-text-secondary">
                    contact@awi.fr · +33 1 87 21 02 11
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-medium text-text-muted">
                  Audit du
                </div>
                <div className="mt-1 text-[14px] font-medium text-text-primary">{client.date}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReportPage>
  );
}

function KPI({ label, value, suffix, hint }: { label: string; value: string | number; suffix?: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card p-4">
      <div className="text-[11px] font-medium text-text-muted">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-[34px] font-semibold leading-none tabular-nums text-text-primary">
          {value}
        </span>
        {suffix && <span className="text-[14px] text-text-muted">{suffix}</span>}
      </div>
      {hint && <div className="mt-1 text-[11px] font-light text-text-secondary">{hint}</div>}
    </div>
  );
}
