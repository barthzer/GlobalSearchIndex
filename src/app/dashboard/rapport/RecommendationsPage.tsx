import type { Generation } from "@/components/GenerationProvider";
import ReportPage from "./ReportPage";
import { PageHeader } from "./AnalysePage";
import { recommendations, type Recommendation } from "./recommendations";
import { PRIORITY_STYLE, PriorityBadge, PillarBadge } from "@/components/recoBadges";

/** Nombre de recommandations par page (évite qu'une carte soit coupée). */
export const RECO_PER_PAGE = 4;

interface Props {
  client: Generation;
  startPage?: number;
  totalPages?: number;
}

function RecoCard({ rec, index }: { rec: Recommendation; index: number }) {
  const p = PRIORITY_STYLE[rec.priority];
  return (
    <li className="rounded-2xl border border-border-subtle bg-bg-card p-4">
      <div className="flex items-start gap-3">
        {/* Index — coloré par priorité */}
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[12px] font-semibold tabular-nums ${p.index}`}>
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {/* Badges — priorité (barres) + pilier (icône/couleur) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={rec.priority} />
            <PillarBadge pillar={rec.pillar} />
          </div>

          {/* Titre = wording marché */}
          <p className="text-[13px] font-semibold leading-snug text-text-primary">{rec.title}</p>

          {/* Observation technique */}
          <p className="text-[12px] font-light leading-relaxed text-text-secondary">{rec.observation}</p>

          {/* Action à mener — encart gris */}
          <div className="rounded-lg border border-card-inner-border bg-card-inner-bg px-3 py-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-accent-pink">Action à mener</p>
            <div className="flex items-start gap-2">
              <svg className="mt-[2px] h-3 w-3 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
              <p className="text-[12px] font-light leading-relaxed text-text-primary">{rec.action}</p>
            </div>
          </div>

          {/* Gain estimé */}
          <p className="text-[11px] font-light leading-relaxed text-text-secondary">
            <span className="font-medium text-text-primary">Gain estimé : </span>
            {rec.gain}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function RecommendationsPage({ client, startPage = 3, totalPages }: Props) {
  // Découpe en pages pour ne jamais couper une carte.
  const chunks: Recommendation[][] = [];
  for (let i = 0; i < recommendations.length; i += RECO_PER_PAGE) {
    chunks.push(recommendations.slice(i, i + RECO_PER_PAGE));
  }

  return (
    <>
      {chunks.map((chunk, pageIdx) => {
        const pageNum = startPage + pageIdx;
        return (
          <ReportPage
            key={pageIdx}
            pageNumber={pageNum}
            totalPages={totalPages}
            id={pageIdx === 0 ? "page-recommandations" : undefined}
          >
            <div className="flex h-full flex-col">
              <PageHeader
                title="Plan d'action prioritaire"
                subtitle={`Page ${String(pageNum).padStart(2, "0")} · Recommandations${chunks.length > 1 ? ` (${pageIdx + 1}/${chunks.length})` : ""}`}
                client={client}
              />

              {pageIdx === 0 && (
                <p className="mt-4 max-w-[150mm] text-[12px] font-light leading-relaxed text-text-secondary">
                  {recommendations.length} leviers identifiés à l&apos;issue du diagnostic, classés par ordre de priorité et de gain estimé.
                </p>
              )}

              <ol className="mt-4 flex flex-col gap-2.5">
                {chunk.map((rec, j) => (
                  <RecoCard key={rec.title} rec={rec} index={pageIdx * RECO_PER_PAGE + j} />
                ))}
              </ol>
            </div>
          </ReportPage>
        );
      })}
    </>
  );
}
