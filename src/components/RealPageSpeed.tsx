"use client";

// Rendu réel de PageSpeed depuis le rawData du score page_speed (Lighthouse).
// Catégories : score 0-100 (bandes Lighthouse standard). Métriques CWV : le `status`
// vient du SERVEUR (poor/average/good) → la couleur ne recalcule pas le seuil.
interface PsCategory {
  label: string;
  score: number;
}
interface PsMetric {
  label: string;
  value: number;
  unit: string;
  status: string;
}
interface PageSpeedRaw {
  mobile?: { categories?: PsCategory[]; metrics?: PsMetric[] } | null;
}

function catColor(score: number): string {
  if (score < 50) return "text-red-400";
  if (score < 90) return "text-amber-400";
  return "text-emerald-400";
}
function metricColor(status: string): string {
  if (status === "poor" || status === "danger") return "text-red-400";
  if (status === "average" || status === "warning") return "text-amber-400";
  return "text-emerald-400";
}
function fmt(value: number, unit: string): string {
  const n = value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  return unit === "s" ? `${n} s` : unit === "ms" ? `${n} ms` : `${n}${unit}`;
}

export default function RealPageSpeed({
  raw,
  reason,
}: {
  raw: PageSpeedRaw | null;
  reason?: string | null;
}) {
  const cats = raw?.mobile?.categories ?? [];
  const metrics = raw?.mobile?.metrics ?? [];

  // Donnée absente (crawl bloqué / dégradé) : on le DIT, jamais un bloc qui
  // disparaît en silence. Avec la raison si le serveur l'a donnée.
  if (cats.length === 0 && metrics.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-card p-5 md:p-6">
        <div className="mb-2 flex items-center gap-2.5">
          <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          <span className="text-[14px] font-medium text-text-primary">
            Google PageSpeed Insights
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-text-muted">
          PageSpeed non disponible pour ce site
          {reason ? ` — ${reason}` : " (le crawl n'a pas produit de données)"}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
        <span className="text-[14px] font-medium text-text-primary">
          Google PageSpeed Insights
        </span>
        <span className="text-[11px] font-light text-text-muted">mobile</span>
      </div>

      {cats.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cats.map((c) => (
            <div
              key={c.label}
              className="flex flex-col items-center rounded-xl border border-border-subtle bg-card-inner-bg py-4"
            >
              <span className={`text-2xl font-bold tabular-nums ${catColor(c.score)}`}>
                {c.score}
              </span>
              <span className="text-[11px] text-text-muted">/100</span>
              <span className="mt-1 text-center text-[11.5px] text-text-secondary">
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-border-subtle bg-card-inner-bg px-3 py-2.5">
              <div className={`text-[15px] font-semibold tabular-nums ${metricColor(m.status)}`}>
                {fmt(m.value, m.unit)}
              </div>
              <div className="mt-0.5 text-[11px] leading-tight text-text-muted">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
