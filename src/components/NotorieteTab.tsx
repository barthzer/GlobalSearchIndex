"use client";

import { useEffect, useState } from "react";
import {
  fetchProjectScores,
  anyProcessing,
  type ProjectScore,
  type ScoreDisplay,
} from "@/lib/scores";
import {
  mapNotoriete,
  pickNotoriete,
  fmtFr,
  growthShown,
  type BacklinksView,
  type MediaView,
} from "@/lib/notoriete";
import RealScoreArc from "./RealScoreArc";

// M7a — jauge d'autorité (5 régimes, MÊME bloc display que la carte Autorité de
// l'onglet Analyse : source unique, pas de 2e calcul) + backlinks + grands médias.
// Le benchmark composite, le rang et le plan éditorial arrivent en M7b.

const trophyIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>
);

function CardShell({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[260px] flex-col rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
      <div className="mb-4 flex w-full items-center gap-2">
        <span className="text-text-primary/80">{icon}</span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

const backlinksIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
  </svg>
);
const mediaIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
  </svg>
);

function BacklinksCard({ data }: { data: BacklinksView }) {
  return (
    <CardShell label="Backlinks" icon={backlinksIcon}>
      <div className="flex w-full flex-1 flex-col justify-center gap-5">
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Total
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-[32px] font-bold leading-none tracking-tight tabular-nums text-text-primary">
              {fmtFr(data.total)}
            </span>
            {growthShown(data.growth) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[12px] font-bold text-emerald-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
                {data.growth}
              </span>
            )}
          </div>
          {growthShown(data.growth) && (
            <div className="mt-1 text-[11px] font-light text-text-muted">
              depuis le mois dernier
            </div>
          )}
        </div>
        <div className="border-t border-border-subtle pt-4">
          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Domaines
          </div>
          <div className="text-[16px] font-bold tracking-tight tabular-nums text-text-primary">
            {fmtFr(data.domains)}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function MajorMediaCard({ data }: { data: MediaView }) {
  return (
    <CardShell label="Grands médias" icon={mediaIcon}>
      <div className="mb-3 grid w-full grid-cols-2 gap-x-5">
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
            Mentions
          </div>
          <div className="text-[20px] font-bold tracking-tight tabular-nums text-text-primary">
            {data.mentionsCount}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-wrap gap-1.5">
        {data.pills.map((p) => (
          <span
            key={p}
            className="rounded-lg border border-border-subtle bg-card-inner-bg px-2.5 py-1.5 text-[11px] font-semibold text-text-secondary"
          >
            {p}
          </span>
        ))}
      </div>
    </CardShell>
  );
}

// État plein-onglet quand le score notoriété n'est pas prêt (règle COMEX : jamais
// de 0 affichés pendant le calcul, jamais de mock).
function NotorieteEmpty({ score }: { score: ProjectScore | undefined }) {
  const status = score?.status;
  const isProcessing = status === "pending" || status === "processing";
  const isError = status === "error";
  const msg = isError
    ? "Une erreur est survenue. Relancez l'analyse depuis l'onglet Analyse."
    : isProcessing
      ? "Analyse de notoriété en cours (backlinks + scan médias, jusqu'à 5 min au premier appel)…"
      : "L'analyse de notoriété n'est pas encore disponible pour ce projet.";
  return (
    <div className="animate-fade-up flex flex-col items-center rounded-2xl border border-border-subtle bg-bg-card py-16 text-center backdrop-blur-[6px]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-card-inner-bg">
        {isProcessing ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-pink/30 border-t-accent-pink" />
        ) : (
          <svg className="h-5 w-5 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        )}
      </div>
      <h2 className="mb-2 text-lg font-medium text-text-primary">
        {isError ? "Analyse de notoriété en erreur" : "Analyse de notoriété"}
      </h2>
      <p className="max-w-md text-sm font-light leading-relaxed text-text-secondary">
        {msg}
      </p>
    </div>
  );
}

export default function NotorieteTab({ projectId }: { projectId: string }) {
  const [scores, setScores] = useState<ProjectScore[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function load() {
      try {
        const s = await fetchProjectScores(projectId);
        if (!active) return;
        setScores(s);
        setError(false);
        if (anyProcessing(s)) timer = setTimeout(load, 3000);
      } catch {
        if (active) setError(true);
      }
    }
    setScores(null);
    setError(false);
    load();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [projectId]);

  if (error) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-card p-6 text-[13px] text-text-muted">
        Impossible de charger la notoriété — réessayez.
      </div>
    );
  }
  if (!scores) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl border border-border-subtle bg-bg-card" />
        ))}
      </div>
    );
  }

  const { noto, authority } = pickNotoriete(scores);

  // Gate sur le score NOTORIÉTÉ (backlinks/médias) : pas prêt → état explicite.
  if (noto?.status !== "completed") {
    return <NotorieteEmpty score={noto} />;
  }

  const mapped = mapNotoriete(noto.rawData);
  // Jauge = bloc display du score AUTORITÉ (identique carte Analyse). Absent → non
  // calculable, jamais un 0 fabriqué.
  const authDisplay: ScoreDisplay = authority?.display ?? {
    type: "authority",
    scorable: false,
    value: null,
    absolute: false,
    neutralArc: false,
    tone: "muted",
    label: null,
    message: "Autorité non disponible pour ce projet.",
    caption: "Non calculable",
  };

  return (
    <div className="animate-fade-up pb-4">
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-4 py-3">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
        </svg>
        <p className="text-[13.5px] font-light leading-relaxed text-text-primary">
          L&apos;autorité média se construit dans la durée : backlinks de qualité,
          couverture par les grands titres et rythme éditorial régulier renforcent
          votre crédibilité SEO et auprès des moteurs IA.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RealScoreArc label="Score d'autorité" icon={trophyIcon} display={authDisplay} />
        {mapped && <BacklinksCard data={mapped.backlinks} />}
        {mapped && <MajorMediaCard data={mapped.medias} />}
      </section>
    </div>
  );
}
