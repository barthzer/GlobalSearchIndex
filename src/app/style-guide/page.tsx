"use client";

import ThemeToggle from "@/components/ThemeToggle";

// Tokens — référence visuelle. Source de vérité = app/src/app/globals.css

const colorGroups = [
  {
    title: "Surfaces",
    description: "Fonds de page, cards et conteneurs",
    tokens: [
      { var: "--bg-primary", tw: "bg-bg-primary" },
      { var: "--bg-overlay", tw: "bg-bg-overlay" },
      { var: "--bg-card", tw: "bg-bg-card" },
      { var: "--bg-card-hover", tw: "bg-bg-card-hover" },
      { var: "--bg-footer", tw: "bg-bg-footer" },
      { var: "--bg-sidebar", tw: "bg-bg-sidebar" },
      { var: "--card-inner-bg", tw: "bg-card-inner-bg" },
      { var: "--modal-bg", tw: "bg-modal-bg" },
      { var: "--input-bg", tw: "bg-input-bg" },
      { var: "--arc-bg", tw: "bg-arc-bg" },
    ],
  },
  {
    title: "Bordures",
    description: "Lignes et séparateurs",
    tokens: [
      { var: "--border-subtle", tw: "border-border-subtle" },
      { var: "--border-badge", tw: "border-border-badge" },
      { var: "--card-inner-border", tw: "border-card-inner-border" },
    ],
  },
  {
    title: "Texte",
    description: "Hiérarchie typographique",
    tokens: [
      { var: "--text-primary", tw: "text-text-primary" },
      { var: "--text-heading", tw: "text-text-heading" },
      { var: "--text-secondary", tw: "text-text-secondary" },
      { var: "--text-muted", tw: "text-text-muted" },
      { var: "--text-input", tw: "text-text-input" },
    ],
  },
  {
    title: "Accents",
    description: "Couleurs de marque",
    tokens: [
      { var: "--accent-purple", tw: "bg-accent-purple" },
      { var: "--accent-pink", tw: "bg-accent-pink" },
      { var: "--accent-pink-light", tw: "bg-accent-pink-light" },
    ],
  },
  {
    title: "Statuts",
    description: "Sémantique fonctionnelle",
    tokens: [
      { var: "--color-success", tw: "bg-success" },
      { var: "--color-warning", tw: "bg-warning" },
      { var: "--color-danger", tw: "bg-danger" },
    ],
  },
];

const fontSizes = [
  { token: "--text-xs", size: "11px", note: "Micro labels, badges" },
  { token: "--text-sm", size: "12px", note: "Captions, sous-labels" },
  { token: "--text-md", size: "13px", note: "Body small" },
  { token: "--text-base", size: "14px", note: "Body, boutons" },
  { token: "--text-body", size: "15px", note: "Paragraphes par défaut" },
  { token: "--text-body-lg", size: "16px", note: "H3 cards" },
  { token: "--text-lg", size: "20px", note: "Titres section" },
  { token: "--text-xl", size: "24px", note: "Titres page" },
  { token: "--text-2xl", size: "32px", note: "Gros nombres / KPI" },
  { token: "--text-display", size: "60px", note: "H1 cover" },
];

const fontWeights = [
  { label: "Light", weight: 300 },
  { label: "Regular", weight: 400 },
  { label: "Medium", weight: 500 },
  { label: "Semibold", weight: 600 },
  { label: "Bold", weight: 700 },
];

const fontFamilies = [
  { name: "Outfit (sans)", varName: "--font-outfit" },
  { name: "Instrument Serif", varName: "--font-instrument-serif" },
  { name: "Manrope", varName: "--font-manrope" },
  { name: "Space Grotesk", varName: "--font-space-grotesk" },
];

const spacings = [
  { label: "1", value: "4px" },
  { label: "2", value: "8px" },
  { label: "3", value: "12px" },
  { label: "4", value: "16px" },
  { label: "5", value: "20px" },
  { label: "6", value: "24px" },
  { label: "8", value: "32px" },
  { label: "10", value: "40px" },
  { label: "12", value: "48px" },
  { label: "16", value: "64px" },
];

const radii = [
  { label: "sm", value: "6px" },
  { label: "md (lg)", value: "8px" },
  { label: "xl", value: "12px" },
  { label: "2xl", value: "16px" },
  { label: "3xl", value: "24px" },
  { label: "Full", value: "9999px" },
];

const shadows = [
  { token: "--shadow-card", note: "Highlight subtil sur les cards" },
  { token: "--shadow-floating", note: "Éléments flottants (dropdowns, tooltips)" },
  { token: "--shadow-cta", note: "Boutons CTA primaires (teinté brand)" },
];

const easings = [
  { token: "--ease-out", value: "cubic-bezier(0.23, 1, 0.32, 1)", note: "Sortie douce, défaut" },
  { token: "--ease-in-out", value: "cubic-bezier(0.77, 0, 0.175, 1)", note: "Symétrique" },
  { token: "--ease-expo", value: "cubic-bezier(0.16, 1, 0.3, 1)", note: "Accélération expo (entrées)" },
];

const durations = [
  { token: "--motion-instant", value: "100ms", note: "Réactions instantanées" },
  { token: "--motion-fast", value: "200ms", note: "Hovers, micro-interactions" },
  { token: "--motion-base", value: "300ms", note: "Transitions standard" },
  { token: "--motion-slow", value: "600ms", note: "Entrées, fade-up" },
  { token: "--motion-slowest", value: "1200ms", note: "Animations à fort impact" },
];

const sections = [
  { id: "colors", label: "Couleurs" },
  { id: "typography", label: "Typographie" },
  { id: "spacing", label: "Espacements" },
  { id: "radius", label: "Coins" },
  { id: "shadows", label: "Ombres" },
  { id: "motion", label: "Mouvement" },
  { id: "components", label: "Composants" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-border-subtle py-12">
      <h2 className="mb-6 text-2xl font-medium tracking-tight text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ varName, tw }: { varName: string; tw: string }) {
  const isText = tw.startsWith("text-");
  const isBorder = tw.startsWith("border-");
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-card p-3">
      {isText ? (
        <div className="flex h-16 items-center justify-center rounded-lg bg-card-inner-bg">
          <span className={`text-2xl font-semibold ${tw}`}>Aa</span>
        </div>
      ) : isBorder ? (
        <div className={`h-16 rounded-lg border-2 bg-card-inner-bg ${tw}`} />
      ) : (
        <div className={`h-16 rounded-lg ${tw}`} style={{ background: `var(${varName})` }} />
      )}
      <div className="mt-2 font-mono text-[11px] text-text-secondary">{varName}</div>
      <div className="font-mono text-[10px] text-text-muted">{tw}</div>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-bg-primary/80 px-8 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-text-primary">Design system</h1>
            <p className="text-[12px] font-light text-text-secondary">
              Tokens, typographie et composants — source : <span className="font-mono text-text-muted">globals.css</span>
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Anchor nav */}
        <nav className="mx-auto mt-4 flex max-w-6xl flex-wrap gap-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-border-subtle bg-card-inner-bg px-3 py-1 text-[12px] font-medium text-text-secondary transition-colors duration-150 hover:border-border-badge hover:bg-bg-card-hover hover:text-text-primary"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-8">
        {/* Colors */}
        <Section id="colors" title="Couleurs">
          <div className="flex flex-col gap-10">
            {colorGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-1 text-[length:var(--text-body-lg)] font-medium text-text-heading">
                  {group.title}
                </h3>
                <p className="mb-4 text-[13px] font-light text-text-secondary">{group.description}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {group.tokens.map((t) => (
                    <Swatch key={t.var} varName={t.var} tw={t.tw} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section id="typography" title="Typographie">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-[length:var(--text-body-lg)] font-medium text-text-heading">
                Familles
              </h3>
              <div className="flex flex-col gap-3">
                {fontFamilies.map((f) => (
                  <div
                    key={f.varName}
                    className="rounded-xl border border-border-subtle bg-bg-card p-4"
                    style={{ fontFamily: `var(${f.varName})` }}
                  >
                    <div className="text-2xl text-text-primary">{f.name}</div>
                    <div className="mt-1 font-mono text-[11px] text-text-muted">{f.varName}</div>
                    <div className="mt-2 text-[14px] font-light text-text-secondary">
                      The quick brown fox jumps over the lazy dog · 0123456789
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-[length:var(--text-body-lg)] font-medium text-text-heading">
                Échelle
              </h3>
              <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
                <div className="flex flex-col gap-2">
                  {fontSizes.map((s) => (
                    <div key={s.token} className="flex items-baseline gap-4 border-b border-border-subtle py-2 last:border-b-0">
                      <div className="w-32 shrink-0">
                        <div className="font-mono text-[11px] text-text-secondary">{s.token}</div>
                        <div className="font-mono text-[10px] text-text-muted tabular-nums">{s.size}</div>
                      </div>
                      <span className="flex-1 text-text-primary" style={{ fontSize: s.size }}>
                        Aa
                      </span>
                      <span className="text-[11px] font-light text-text-secondary">{s.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="mb-3 mt-8 text-[length:var(--text-body-lg)] font-medium text-text-heading">
                Graisses
              </h3>
              <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
                <div className="flex flex-col gap-1">
                  {fontWeights.map((w) => (
                    <div key={w.label} className="flex items-baseline justify-between border-b border-border-subtle py-2 last:border-b-0">
                      <span className="text-base text-text-primary" style={{ fontWeight: w.weight }}>
                        {w.label}
                      </span>
                      <span className="font-mono text-[11px] text-text-muted">{w.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Spacing */}
        <Section id="spacing" title="Espacements">
          <p className="mb-4 text-[13px] font-light text-text-secondary">
            Échelle Tailwind par incréments de 4px. À utiliser pour padding, margin, gap.
          </p>
          <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
            <div className="flex flex-col gap-2">
              {spacings.map((s) => (
                <div key={s.label} className="flex items-center gap-4 border-b border-border-subtle py-2 last:border-b-0">
                  <span className="w-12 font-mono text-[12px] text-text-muted tabular-nums">{s.label}</span>
                  <div className="h-3 rounded-sm bg-accent-pink" style={{ width: s.value }} />
                  <span className="font-mono text-[11px] text-text-muted">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Radius */}
        <Section id="radius" title="Coins arrondis">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {radii.map((r) => (
              <div key={r.label} className="rounded-xl border border-border-subtle bg-bg-card p-3">
                <div
                  className="h-16 w-full bg-card-inner-bg"
                  style={{ borderRadius: r.value }}
                />
                <div className="mt-2 font-mono text-[12px] text-text-secondary">{r.label}</div>
                <div className="font-mono text-[10px] text-text-muted">{r.value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Shadows */}
        <Section id="shadows" title="Ombres">
          <p className="mb-4 text-[13px] font-light text-text-secondary">
            Tokens d&apos;ombre tokenisés. À utiliser via <span className="font-mono">box-shadow: var(--shadow-XXX)</span>.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {shadows.map((sh) => (
              <div key={sh.token} className="rounded-xl border border-border-subtle bg-bg-card p-4">
                <div
                  className="h-20 w-full rounded-lg bg-card-inner-bg"
                  style={{ boxShadow: `var(${sh.token})` }}
                />
                <div className="mt-3 font-mono text-[12px] text-text-secondary">{sh.token}</div>
                <div className="mt-1 text-[11px] font-light text-text-muted">{sh.note}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Motion */}
        <Section id="motion" title="Mouvement">
          <h3 className="mb-3 text-[length:var(--text-body-lg)] font-medium text-text-heading">
            Easings
          </h3>
          <div className="mb-8 grid gap-3 md:grid-cols-3">
            {easings.map((e) => (
              <div key={e.token} className="rounded-xl border border-border-subtle bg-bg-card p-4">
                <div className="font-mono text-[13px] text-text-primary">{e.token}</div>
                <div className="mt-1 text-[11px] font-light text-text-secondary">{e.note}</div>
                <div className="mt-3 font-mono text-[9px] text-text-muted">{e.value}</div>
              </div>
            ))}
          </div>

          <h3 className="mb-3 text-[length:var(--text-body-lg)] font-medium text-text-heading">
            Durées
          </h3>
          <div className="rounded-xl border border-border-subtle bg-bg-card p-4">
            <div className="flex flex-col gap-2">
              {durations.map((d) => (
                <div key={d.token} className="flex items-center gap-4 border-b border-border-subtle py-2 last:border-b-0">
                  <div className="w-40 shrink-0">
                    <div className="font-mono text-[12px] text-text-primary">{d.token}</div>
                    <div className="font-mono text-[10px] text-text-muted tabular-nums">{d.value}</div>
                  </div>
                  <span className="text-[12px] font-light text-text-secondary">{d.note}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Components */}
        <Section id="components" title="Composants">
          <p className="mb-6 text-[13px] font-light text-text-secondary">
            Aperçu des composants de base. Chaque composant doit consommer uniquement les tokens listés ci-dessus.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Buttons */}
            <div className="rounded-xl border border-border-subtle bg-bg-card p-5">
              <div className="mb-4 text-[12px] font-medium text-text-secondary">Boutons</div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-purple via-accent-pink via-[47%] to-accent-pink-light px-6 py-3 text-sm font-medium text-white">
                  Primary
                </button>
                <button className="inline-flex items-center gap-2 rounded-full bg-text-primary px-6 py-3 text-sm font-medium text-bg-primary">
                  Secondary
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-card px-6 py-3 text-sm font-medium text-text-primary">
                  Tertiary
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="rounded-xl border border-border-subtle bg-bg-card p-5">
              <div className="mb-4 text-[12px] font-medium text-text-secondary">Badges</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
                  Succès
                </span>
                <span className="rounded-full border border-warning/20 bg-warning/10 px-2.5 py-0.5 text-[11px] font-medium text-warning">
                  Attention
                </span>
                <span className="rounded-full border border-danger/20 bg-danger/10 px-2.5 py-0.5 text-[11px] font-medium text-danger">
                  Critique
                </span>
                <span className="rounded-full border border-accent-pink/25 bg-accent-pink/10 px-2.5 py-0.5 text-[11px] font-medium text-accent-pink">
                  Marque
                </span>
              </div>
            </div>

            {/* Card */}
            <div className="rounded-xl border border-border-subtle bg-bg-card p-5">
              <div className="mb-4 text-[12px] font-medium text-text-secondary">Card</div>
              <div className="rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px]">
                <div className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
                  Titre de la card
                </div>
                <p className="mt-2 text-[length:var(--text-body)] font-light text-text-secondary">
                  Description courte. Pattern réutilisable : `rounded-2xl border border-border-subtle bg-bg-card p-5`.
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="rounded-xl border border-border-subtle bg-bg-card p-5">
              <div className="mb-4 text-[12px] font-medium text-text-secondary">Input</div>
              <input
                type="text"
                placeholder="Tape ici..."
                className="w-full rounded-xl border border-border-subtle bg-card-inner-bg px-4 py-2.5 text-[length:var(--text-body)] font-light text-text-primary outline-none placeholder:text-text-muted focus:border-accent-pink/50"
              />
            </div>
          </div>
        </Section>

        <div className="py-12 text-center text-[12px] font-light text-text-muted">
          Source : <span className="font-mono">app/src/app/globals.css</span> · Modifie les tokens là-bas, cette page se met à jour automatiquement.
        </div>
      </main>
    </div>
  );
}
