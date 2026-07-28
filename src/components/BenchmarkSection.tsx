"use client";

import type { BenchmarkView, CompetitorRow } from "@/lib/notoriete";
import { fmtFr } from "@/lib/notoriete";

// M7b — Benchmark concurrents (INTERNE, jamais rendu côté prospect). Portage
// fidèle de apps/web (benchmark-section + competitors-table). 4 modes composite.

function PositionBlock({
  rank,
  total,
  hint,
  pending,
  unscored,
}: {
  rank: number;
  total: number;
  hint: string;
  pending: boolean;
  unscored: boolean;
}) {
  const special = pending || unscored;
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
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
        {special ? (
          <span className="text-[28px] font-bold leading-tight tracking-tight text-text-muted">
            {pending ? "En cours" : "Non classé"}
          </span>
        ) : (
          <div className="flex items-baseline">
            <span className="text-[56px] font-bold leading-none tracking-tight tabular-nums text-text-primary">
              {rank}
            </span>
            <span className="ml-1 text-base font-semibold text-text-muted">/ {total}</span>
          </div>
        )}
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          {pending ? "Classement en cours" : unscored ? "Autorité non classée" : "Rang concurrentiel"}
        </span>
        {hint && <p className="mt-1 text-[12px] font-light leading-snug text-text-secondary">{hint}</p>}
      </div>
    </div>
  );
}

function NonClasseChip({ reason }: { reason?: "growth_null" | "bas_floor" }) {
  const tooltip =
    reason === "bas_floor"
      ? "Autorité trop faible (BAS ≤ 4) — hors panel de comparaison."
      : reason === "growth_null"
        ? "Croissance des backlinks indisponible — non inclus au classement."
        : "Non classé.";
  return (
    <span className="inline-block rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-text-muted" title={tooltip}>
      non classé
    </span>
  );
}

// Colonne Autorité /100 composite (primaire) + BAS en appui. undefined = en cours.
function CompositeCell({
  composite,
  reason,
  bas,
  ready,
}: {
  composite?: number | null;
  reason?: "growth_null" | "bas_floor";
  bas: number;
  ready: boolean;
}) {
  if (!ready || composite === undefined) {
    return <span className="text-[12px] font-light italic text-text-muted">en cours…</span>;
  }
  if (composite === null) return <NonClasseChip reason={reason} />;
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="inline-block min-w-[44px] rounded-full bg-accent-pink/10 px-3 py-1 text-center text-[13px] font-semibold tabular-nums text-text-primary">
        {composite}
      </span>
      <span className="text-[10px] font-light tabular-nums text-text-muted">BAS {bas}</span>
    </div>
  );
}

// BAS = échelle composite propre, PAS un /100 (56 est excellent). Badge NEUTRE
// monochrome : le classement se lit par l'ORDRE des lignes, pas par la couleur.
function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="inline-block min-w-[44px] rounded-full bg-white/[0.06] px-3 py-1 text-center text-[13px] font-semibold tabular-nums text-text-primary">
      {score}
    </span>
  );
}

function CompetitorsTable({
  rows,
  clientName,
  compositeMode,
  compositeReady,
}: {
  rows: CompetitorRow[];
  clientName: string;
  compositeMode: boolean;
  compositeReady: boolean;
}) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
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
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              {["Entreprise", "Médias", "Présence principale", "Domaines réf."].map((h, i) => (
                <th
                  key={h}
                  className={`border-b border-border-subtle px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted ${i === 0 || i === 2 ? "text-left" : "text-right"}`}
                >
                  {h}
                </th>
              ))}
              <th className="border-b border-border-subtle px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {compositeMode ? "Autorité /100" : "BAS"}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isYou = row.isYou;
              const unavailable = row.unavailable === true;
              const rowKey = `${row.domain || row.name}-${idx}`;
              const hasMedia = Array.isArray(row.media_details) && row.media_details.length > 0;
              return (
                <tr
                  key={rowKey}
                  className={isYou ? "bg-accent-pink/[0.08] shadow-[inset_3px_0_0_var(--gsi-accent-pink)]" : ""}
                >
                  <td className="border-b border-border-subtle px-3 py-4 text-[14px] font-semibold text-text-primary">
                    {isYou ? clientName : row.name}
                    {unavailable && (
                      <span className="ml-2 text-[11px] font-normal text-text-muted">
                        {row.unavailable_reason === "insufficient" || row.unavailable_reason === "not_measured"
                          ? "(données insuffisantes)"
                          : "(domaine non indexé)"}
                      </span>
                    )}
                  </td>
                  {unavailable ? (
                    <td colSpan={4} className="border-b border-border-subtle px-3 py-4 text-[13px] font-light italic text-text-muted">
                      {row.unavailable_reason === "insufficient" || row.unavailable_reason === "not_measured"
                        ? "Données insuffisantes : profil de liens trop faible pour mesurer l'autorité de ce domaine. Ce n'est pas une erreur de l'outil."
                        : "Ce domaine n'est pas référencé dans la base de backlinks : aucune donnée d'autorité à afficher. Ce n'est pas un site à faible autorité, il n'y est simplement pas mesuré."}
                    </td>
                  ) : (
                    <>
                      <td className={`border-b border-border-subtle px-3 py-4 text-right text-[14px] tabular-nums ${isYou ? "font-semibold text-text-primary" : "text-text-secondary"}`}>
                        {row.medias === null || row.medias === undefined ? (
                          row.medias_status === "processing" ? (
                            <span className="text-[11px] font-light italic text-text-muted">analyse…</span>
                          ) : row.medias_status === "error" ? (
                            <span className="text-[11px] font-light text-text-muted">échec</span>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )
                        ) : (
                          row.medias
                        )}
                      </td>
                      <td className="border-b border-border-subtle px-3 py-4 text-[13px] font-light text-text-muted">
                        {hasMedia && row.media_details ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {row.media_details.map((d, i) => (
                              <span
                                key={`${rowKey}-m-${d.media}-${i}`}
                                className="inline-flex items-center gap-1 rounded-full border border-accent-pink/20 bg-accent-pink/[0.08] px-2 py-0.5 text-[12px] font-medium text-text-primary"
                                title={`${d.label} — ${fmtFr(d.backlinks)} backlink${d.backlinks > 1 ? "s" : ""}`}
                              >
                                {d.label}
                                <span className="opacity-60">·</span>
                                <span className="tabular-nums opacity-70">{fmtFr(d.backlinks)}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="border-b border-border-subtle px-3 py-4 text-right text-[14px] tabular-nums text-text-secondary">
                        {row.ref_domains == null ? <span className="text-text-muted">—</span> : fmtFr(row.ref_domains)}
                      </td>
                      <td className="border-b border-border-subtle px-3 py-4 text-right">
                        {compositeMode ? (
                          <CompositeCell composite={row.composite} reason={row.composite_reason} bas={row.score} ready={compositeReady} />
                        ) : (
                          <ScoreBadge score={row.score} />
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Légende toujours visible (mode BAS) : tue le paradoxe « beaucoup de
          domaines → petit BAS » lu au coup d'œil. Retirée en composite (une échelle). */}
      {!compositeMode && (
        <p className="mt-3 text-[11px] font-light leading-snug text-text-muted">
          Le classement suit le <span className="font-medium">BAS</span> (qualité d&apos;autorité), pas
          le nombre de domaines référents — un site sain avec peu de liens peut devancer un gros profil
          de liens de faible qualité.
        </p>
      )}
    </section>
  );
}

export default function BenchmarkSection({
  view,
  clientName,
}: {
  view: BenchmarkView;
  clientName: string;
}) {
  // Verrouillé (pas de benchmark) : état explicite. Le déblocage (saisie
  // concurrents + POST) est un chantier ultérieur (M8) — ici read-only.
  if (!view.unlocked || view.rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-card p-8 text-center backdrop-blur-[6px]">
        <h3 className="mb-2 text-[length:var(--text-body-lg)] font-semibold text-text-primary">
          Benchmark concurrents non débloqué
        </h3>
        <p className="mx-auto max-w-md text-[13px] font-light leading-relaxed text-text-secondary">
          Renseignez 3 concurrents depuis l&apos;interface commerciale pour comparer la couverture
          média et l&apos;autorité sur 12 mois.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-5">
      <PositionBlock
        rank={view.rank}
        total={view.total}
        hint={view.rankHint}
        pending={view.compositePending}
        unscored={view.compositeUnscored}
      />
      <CompetitorsTable
        rows={view.rows}
        clientName={clientName}
        compositeMode={view.compositeMode}
        compositeReady={view.compositeReady}
      />
    </div>
  );
}
