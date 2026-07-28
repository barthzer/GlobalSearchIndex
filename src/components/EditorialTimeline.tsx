import type { EditorialSlot } from "@/lib/notoriete";

// M7b — Calendrier éditorial média (marronnier). Portage de apps/web
// (editorial-timeline). Les logos de marque sont remplacés par le libellé texte
// (media_label) — simplification M7b, pas de portage des SVG de marque.

const tagIcons: Record<string, string> = {
  "Priorité 1":
    "M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z",
  Notoriété:
    "M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z",
  Innovation:
    "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z",
  ROI: "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
  Crédibilité:
    "M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z",
  Expertise:
    "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342",
};
const fallbackTag = "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}
// Palette rose → bleu selon la position dans le calendrier.
function paletteAt(ratio: number) {
  const r = lerp(236, 19, ratio);
  const g = lerp(77, 0, ratio);
  const b = lerp(203, 234, ratio);
  return {
    color: `rgb(${r}, ${g}, ${b})`,
    bg: `rgba(${r}, ${g}, ${b}, 0.12)`,
    ring: `rgba(${r}, ${g}, ${b}, 0.3)`,
  };
}

export default function EditorialTimeline({
  slots,
  subtitle,
}: {
  slots: EditorialSlot[];
  subtitle: string | null;
}) {
  // Pas de calendrier → on le DIT (jamais un bloc vide silencieux).
  if (slots.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="mb-2 text-xl font-medium tracking-tight text-text-primary">
          Calendrier éditorial
        </h2>
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-6 text-[13px] font-light leading-relaxed text-text-muted">
          Le calendrier éditorial n&apos;est pas encore disponible pour ce projet.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="mb-1.5 text-xl font-medium tracking-tight text-text-primary">
            Calendrier éditorial
          </h2>
          {subtitle && (
            <p className="max-w-[700px] text-[length:var(--text-body)] font-light leading-relaxed text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>
        <span className="hidden shrink-0 rounded-full border border-border-subtle bg-card-inner-bg px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-muted md:inline-block">
          {slots.length} prises de parole
        </span>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute bottom-3 left-5 top-3 hidden w-px -translate-x-1/2 md:block"
          style={{ background: "linear-gradient(180deg, #ec4dcb 0%, #1300EA 100%)", opacity: 0.4 }}
        />
        <div className="flex flex-col gap-5">
          {slots.map((slot, i) => {
            const c = paletteAt(slots.length > 1 ? i / (slots.length - 1) : 0);
            const iconPath = tagIcons[slot.tag] ?? fallbackTag;
            return (
              <article
                key={i}
                className="relative grid grid-cols-1 gap-4 rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:grid-cols-[160px_minmax(0,1fr)_150px] md:items-center md:gap-5 md:pl-12"
              >
                <span
                  className="pointer-events-none absolute left-5 top-1/2 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 md:block"
                  style={{ background: "var(--gsi-bg-card)", borderColor: c.color, boxShadow: `0 0 0 4px ${c.ring}` }}
                />
                <div className="flex flex-col gap-2">
                  <div className="text-[15px] font-medium leading-none text-text-primary">{slot.month}</div>
                  <span
                    className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                    style={{ background: c.bg, color: c.color }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                    </svg>
                    {slot.tag}
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="mb-1.5 text-[length:var(--text-body-lg)] font-medium leading-snug tracking-tight text-text-primary">
                    {slot.title}
                  </h3>
                  <p className="text-[13px] font-light leading-relaxed text-text-secondary">
                    {slot.description}
                  </p>
                </div>

                <div className="flex md:justify-end">
                  <div className="flex w-fit flex-col items-start gap-1 rounded-xl border border-border-subtle bg-card-inner-bg px-3 py-2">
                    <span className="text-[13px] font-semibold leading-none text-text-primary">
                      {slot.media_label}
                    </span>
                    {slot.media_subtitle && (
                      <span className="text-[11px] font-bold leading-none text-text-muted">
                        {slot.media_subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
