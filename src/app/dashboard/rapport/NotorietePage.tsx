import type { Generation } from "@/components/GenerationProvider";
import { authorityScore, backlinksData, majorMediaData, rankBenchmark, competitorsTable } from "@/components/notoriete/data";
import AWILogo from "@/components/AWILogo";
import RankTrophy from "@/components/RankTrophy";
import ReportPage from "./ReportPage";
import { PageHeader } from "./AnalysePage";

interface Props {
  client: Generation;
  consultant: string;
  pageNumber?: number;
  totalPages?: number;
}

function ScoreColor(score: number): string {
  if (score < 50) return "#ef4444";
  if (score < 75) return "#f97316";
  return "#22c55e";
}

export default function NotorietePage({ client, pageNumber = 5, totalPages }: Props) {
  const leaderRow = competitorsTable.find((c) => !c.isYou) ?? competitorsTable[0];
  const leader = leaderRow.name;
  const leaderScore = leaderRow.score;
  const gap = leaderScore - authorityScore;

  return (
    <ReportPage pageNumber={pageNumber} totalPages={totalPages} id="page-notoriete">
      <div className="flex h-full flex-col">
        <PageHeader title="Notoriété & autorité média" subtitle={`Page ${String(pageNumber).padStart(2, "0")} · Notoriété`} client={client} />

        {/* KPI row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <KPI label="Score d'autorité" value={authorityScore} suffix="/100" />
          <KPI label="Backlinks totaux" value={backlinksData.total.toLocaleString("fr-FR")} hint={backlinksData.growth + " sur 12 mois"} />
          <KPI label="Médias majeurs" value={majorMediaData.mediasCount} hint={`${majorMediaData.articlesCount} articles`} />
        </div>

        {/* Profil de backlinks (autorité) */}
        <div className="mt-3">
          <h3 className="mb-2 text-[12px] font-medium text-text-secondary">Profil de backlinks</h3>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Domaines référents" value={backlinksData.domains} />
            <MiniStat label="Liens médias" value={backlinksData.medias} />
            <MiniStat label="Croissance 12 mois" value={backlinksData.growth} accent />
          </div>
        </div>

        {/* Major media pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-border-subtle bg-card-inner-bg px-4 py-3">
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

        {/* Benchmark concurrents */}
        <div className="mt-4">
          <h3 className="mb-2 flex items-center gap-2 text-[12px] font-medium text-text-secondary">
            Benchmark concurrents
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-card-inner-bg px-2 py-0.5 text-[11px] font-medium text-text-primary">
              <RankTrophy rank={rankBenchmark.rank} size={16} />
              {rankBenchmark.rank}<span className="text-text-muted">/{rankBenchmark.total}</span>
            </span>
          </h3>
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-card">
            <div className="grid grid-cols-[minmax(0,1.1fr)_70px_60px_minmax(0,1.4fr)_56px] border-b border-border-subtle bg-card-inner-bg px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
              <span>Marque</span>
              <span className="text-right">Backlinks</span>
              <span className="text-right">Médias</span>
              <span className="pl-2">Présence éditoriale</span>
              <span className="text-right">Autorité</span>
            </div>
            {competitorsTable.map((row, i) => (
              <div
                key={row.name}
                className={`grid grid-cols-[minmax(0,1.1fr)_70px_60px_minmax(0,1.4fr)_56px] items-center px-3 py-[6px] ${i > 0 ? "border-t border-border-subtle/50" : ""} ${row.isYou ? "bg-accent-pink/[0.06]" : ""}`}
              >
                <span className="flex items-center gap-1.5 truncate text-[11px] font-medium text-text-primary">
                  {row.name}
                  {row.isYou && <span className="rounded-full bg-accent-pink/15 px-1.5 py-[1px] text-[8px] font-semibold uppercase text-accent-pink">Vous</span>}
                </span>
                <span className="text-right text-[11px] tabular-nums text-text-secondary">{row.backlinks.toLocaleString("fr-FR")}</span>
                <span className="text-right text-[11px] tabular-nums text-text-secondary">{row.medias}</span>
                <span className="truncate pl-2 text-[10px] font-light text-text-muted">{row.presence}</span>
                <span className="text-right text-[12px] font-semibold tabular-nums" style={{ color: ScoreColor(row.score) }}>{row.score}</span>
              </div>
            ))}
          </div>
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

        {/* Signature footer */}
        <div className="mt-auto pt-5">
          <div className="rounded-2xl border border-border-subtle bg-card-inner-bg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <AWILogo className="h-9 w-auto shrink-0 text-accent-pink" />
                <div>
                  <div className="text-[11px] font-medium text-text-muted">
                    Pour discuter de ce rapport
                  </div>
                  <div className="mt-0.5 text-[14px] font-medium text-text-primary">contact@awi.fr</div>
                  <div className="text-[12px] font-light text-text-secondary">
                    01 73 03 20 47
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

function MiniStat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-card px-4 py-3">
      <div className="text-[10px] font-medium text-text-muted">{label}</div>
      <div className={`mt-1 text-[20px] font-semibold leading-none tabular-nums ${accent ? "text-success" : "text-text-primary"}`}>
        {value}
      </div>
    </div>
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
