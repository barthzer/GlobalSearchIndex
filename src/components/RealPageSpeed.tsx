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

function metricColor(status: string): string {
  if (status === "poor" || status === "danger") return "text-red-400";
  if (status === "average" || status === "warning") return "text-amber-400";
  return "text-emerald-400";
}
function fmt(value: number, unit: string): string {
  const n = value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  return unit === "s" ? `${n} s` : unit === "ms" ? `${n} ms` : `${n}${unit}`;
}

// Jauge circulaire au style de la maquette Barth (arc coloré + score au centre).
// Couleur = bandes Lighthouse standard (rouge <50, ambre 50-89, vert >=90).
function Gauge({ label, score }: { label: string; score: number }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const color = score >= 90 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const offset = c - (Math.min(Math.max(score, 0), 100) / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[84px] w-[84px]">
        <svg viewBox="0 0 84 84" className="h-[84px] w-[84px] -rotate-90">
          <circle cx="42" cy="42" r={r} fill="none" stroke="var(--card-inner-border)" strokeWidth={6} />
          <circle
            cx="42"
            cy="42"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s var(--ease-in-out)" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-[20px] font-bold tabular-nums"
          style={{ color }}
        >
          {score}
        </div>
      </div>
      <span className="text-center text-[12px] leading-tight text-text-secondary">{label}</span>
    </div>
  );
}

export default function RealPageSpeed({
  raw,
  reason,
  status,
}: {
  raw: PageSpeedRaw | null;
  reason?: string | null;
  status?: string | null;
}) {
  const cats = raw?.mobile?.categories ?? [];
  const metrics = raw?.mobile?.metrics ?? [];
  const isRunning = status === "pending" || status === "processing";

  // Tant que le crawl tourne, on affiche « en cours » : jamais un message
  // définitif (« pas de données ») sur un état provisoire.
  if (cats.length === 0 && metrics.length === 0 && isRunning) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-card p-5 md:p-6">
        <div className="mb-2 flex items-center gap-2.5">
          <svg className="h-4 w-4 animate-spin text-text-muted" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          <span className="text-[14px] font-medium text-text-primary">
            Google PageSpeed Insights
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-text-muted">
          Analyse PageSpeed en cours, les mesures s'afficheront dès que le crawl aura rendu.
        </p>
      </div>
    );
  }

  // Crawl terminé sans donnée exploitable (dégradé) : on le DIT, jamais un bloc
  // qui disparaît en silence. Avec la raison si le serveur l'a donnée.
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
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cats.map((c) => (
            <Gauge key={c.label} label={c.label} score={c.score} />
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
