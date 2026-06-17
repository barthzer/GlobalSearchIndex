"use client";

import { useEffect, useState, Fragment } from "react";
import { ScoreArc } from "./PageSpeedModal";
import ScoreInfoModal from "./ScoreInfoModal";
import InsightNote from "./InsightNote";

function CriterionIcon({ d }: { d: string }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

type DeviceType = "mobile" | "desktop";

interface PageSpeedData {
  scores: typeof mobileScores;
  stats: typeof mobileStats;
}

const mobileScores = [
  {
    label: "Performances",
    score: 73,
    icon: <CriterionIcon d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />,
    info: {
      title: "Performances",
      heading: "Score de performance",
      intro: "Les valeurs sont estimées et peuvent varier. Le calcul du score lié aux performances repose directement sur ces statistiques.",
      criteria: [
        { label: "First Contentful Paint", description: "temps avant le premier affichage de contenu visible par l'utilisateur.", icon: <CriterionIcon d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> },
        { label: "Largest Contentful Paint", description: "temps avant l'affichage de l'élément le plus volumineux visible dans le viewport.", icon: <CriterionIcon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.41a2.25 2.25 0 0 1 3.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /> },
        { label: "Total Blocking Time", description: "durée totale pendant laquelle le thread principal est bloqué et ne peut pas répondre aux interactions.", icon: <CriterionIcon d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /> },
        { label: "Cumulative Layout Shift", description: "mesure la stabilité visuelle, quantifie les décalages inattendus dans la mise en page.", icon: <CriterionIcon d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /> },
        { label: "Speed Index", description: "vitesse à laquelle le contenu est visuellement affiché lors du chargement de la page.", icon: <CriterionIcon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /> },
      ],
      conclusion: "Optimiser ces métriques améliore directement l'expérience utilisateur et votre positionnement dans les résultats de recherche.",
    },
  },
  {
    label: "Accessibilité",
    score: 85,
    icon: <CriterionIcon d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />,
    info: {
      title: "Accessibilité",
      heading: "Score d'accessibilité",
      intro: "Ces vérifications permettent de connaître les possibilités d'amélioration de l'accessibilité de votre application web. La détection automatique ne peut détecter qu'une partie des problèmes et ne garantit pas l'accessibilité de votre application. Un test manuel complémentaire est conseillé.",
      criteria: [
        { label: "Contraste des couleurs", description: "rapport de contraste suffisant entre le texte et l'arrière-plan.", icon: <CriterionIcon d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /> },
        { label: "Attributs ARIA", description: "éléments interactifs correctement étiquetés pour les lecteurs d'écran.", icon: <CriterionIcon d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z M6 6h.008v.008H6V6Z" /> },
        { label: "Navigation clavier", description: "tous les éléments interactifs accessibles et utilisables au clavier.", icon: <CriterionIcon d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" /> },
        { label: "Textes alternatifs", description: "images et médias accompagnés de descriptions pour les technologies d'assistance.", icon: <CriterionIcon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.41a2.25 2.25 0 0 1 3.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /> },
        { label: "Structure sémantique", description: "hiérarchie des titres et landmarks HTML correctement définis.", icon: <CriterionIcon d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /> },
      ],
      conclusion: "L'accessibilité garantit que votre site est utilisable par tous, y compris les personnes en situation de handicap.",
    },
  },
  {
    label: "Bonnes pratiques",
    score: 78,
    icon: <CriterionIcon d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />,
    info: {
      title: "Bonnes pratiques",
      heading: "Score de bonnes pratiques",
      intro: "Évalue le respect des standards web en matière d'expérience utilisateur, de fiabilité, de sécurité et de qualité technique générale.",
      criteria: [
        { label: "Qualité des images", description: "images diffusées à la bonne résolution et au bon format pour éviter le flou ou la surcharge.", icon: <CriterionIcon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.41a2.25 2.25 0 0 1 3.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /> },
        { label: "Sécurité HTTPS et CSP", description: "connexion sécurisée, Content Security Policy efficace contre les attaques XSS et clickjacking.", icon: <CriterionIcon d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /> },
        { label: "Isolation et HSTS", description: "politique HSTS, COOP et Trusted Types pour protéger l'intégrité de l'origine.", icon: <CriterionIcon d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /> },
        { label: "APIs et standards", description: "aucune API obsolète, doctype HTML valide, charset correct, pas d'erreurs console.", icon: <CriterionIcon d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m0 0a2.678 2.678 0 0 1 .766-1.208l3.03-2.496M21 3l-2.25 2.25" /> },
        { label: "Permissions et cookies", description: "aucune demande intrusive au chargement, pas de cookies tiers, saisie non restreinte.", icon: <CriterionIcon d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /> },
      ],
      conclusion: "Respecter ces bonnes pratiques assure une expérience fiable, sécurisée et conforme aux standards du web.",
    },
  },
  {
    label: "SEO",
    score: 92,
    icon: <CriterionIcon d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />,
    info: {
      title: "SEO",
      heading: "Score SEO Lighthouse",
      intro: "Ces vérifications garantissent que votre page suit les conseils de base concernant le référencement naturel. De nombreux facteurs supplémentaires ne sont pas évalués ici, mais peuvent affecter votre classement dans les résultats de recherche, y compris vos performances concernant les Core Web Vitals.",
      criteria: [
        { label: "Balises meta", description: "présence et pertinence des balises title, meta description et viewport.", icon: <CriterionIcon d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z M6 6h.008v.008H6V6Z" /> },
        { label: "Explorabilité", description: "page indexable, fichier robots.txt valide, liens explorables par les moteurs.", icon: <CriterionIcon d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" /> },
        { label: "Données structurées", description: "objets JSON-LD valides et correctement implémentés.", icon: <CriterionIcon d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /> },
        { label: "Mobile-friendly", description: "viewport configuré, taille du texte lisible, éléments tactiles espacés.", icon: <CriterionIcon d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /> },
        { label: "Contenu et liens", description: "liens avec du texte descriptif, attributs hreflang valides, canonical défini.", icon: <CriterionIcon d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /> },
      ],
      conclusion: "Ces essentiels SEO constituent la base technique pour être correctement indexé et classé par Google.",
    },
  },
];

const statTooltips: Record<string, { name: string; desc: string }> = {
  FCP: { name: "First Contentful Paint", desc: "Temps avant le premier affichage visible. Plus c'est rapide, plus l'utilisateur voit vite du contenu." },
  LCP: { name: "Largest Contentful Paint", desc: "Temps de chargement de l'élément principal (image, titre). Doit rester sous 2,5s pour une bonne expérience." },
  TBT: { name: "Total Blocking Time", desc: "Durée pendant laquelle la page ne répond pas aux clics. Un TBT bas signifie une page réactive." },
  CLS: { name: "Cumulative Layout Shift", desc: "Mesure les décalages visuels inattendus. Un CLS de 0 signifie que rien ne bouge pendant le chargement." },
  SI: { name: "Speed Index", desc: "Vitesse d'affichage global du contenu. Plus l'indice est bas, plus le contenu apparaît vite à l'écran." },
};

const mobileStats = [
  { label: "FCP", value: "3,9 s", color: "text-danger" },
  { label: "LCP", value: "4,4 s", color: "text-danger" },
  { label: "TBT", value: "0 ms", color: "text-success" },
  { label: "CLS", value: "0", color: "text-success" },
  { label: "SI", value: "5,1 s", color: "text-warning" },
];

const desktopScores = mobileScores.map((s) => ({
  ...s,
  score:
    s.label === "Performances" ? 91
    : s.label === "Accessibilité" ? 88
    : s.label === "Bonnes pratiques" ? 96
    : 100,
}));

const desktopStats = [
  { label: "FCP", value: "0,8 s", color: "text-success" },
  { label: "LCP", value: "1,2 s", color: "text-success" },
  { label: "TBT", value: "0 ms", color: "text-success" },
  { label: "CLS", value: "0", color: "text-success" },
  { label: "SI", value: "1,4 s", color: "text-success" },
];

const deviceData: Record<DeviceType, PageSpeedData> = {
  mobile: { scores: mobileScores, stats: mobileStats },
  desktop: { scores: desktopScores, stats: desktopStats },
};

export const MONTHS = ["Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr"];

const MONTH_NUM: Record<string, number> = {
  Jan: 1, Fév: 2, Mar: 3, Avr: 4, Mai: 5, Jun: 6, Jul: 7, Aoû: 8, Sep: 9, Oct: 10, Nov: 11, Déc: 12,
};

/**
 * Libellé « Mois année » pour le tooltip de la courbe : la dernière donnée correspond
 * au dernier mois écoulé (année courante), et l'année se décrémente à chaque passage
 * Déc → Jan en remontant la série. Appelé uniquement au survol (pas de risque d'hydratation).
 */
export function monthWithYear(months: string[], idx: number): string {
  let year = new Date().getFullYear();
  for (let i = months.length - 1; i > idx; i--) {
    if (MONTH_NUM[months[i - 1]] > MONTH_NUM[months[i]]) year -= 1;
  }
  return `${months[idx]} ${year}`;
}

const MONTHLY = [8200, 9100, 8700, 10400, 11200, 10800, 12300, 13100, 12600, 14200, 13800, 15400];

export function expandMonthly(monthly: number[], pts: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < monthly.length; i++) {
    const curr = monthly[i];
    const next = monthly[Math.min(i + 1, monthly.length - 1)];
    for (let j = 0; j < pts; j++) {
      const t = j / pts;
      const base = curr + (next - curr) * t;
      const noise = [0.994, 1.006, 0.997, 1.003][j] ?? 1;
      result.push(Math.round(base * noise));
    }
  }
  result.push(monthly[monthly.length - 1]);
  return result;
}

export const trafficData = expandMonthly(MONTHLY, 4);

// Indice de visibilité (source Ahrefs, 0-100) — tendance haussière sur l'année.
const VISIBILITY_MONTHLY = [31, 35, 34, 40, 44, 42, 48, 52, 50, 57, 55, 64];
export const visibilityData = expandMonthly(VISIBILITY_MONTHLY, 4);

// ─── Données sur 2 ans (24 mois) — année précédente + année courante ───
export const MONTHS_2Y = [...MONTHS, ...MONTHS];

const MONTHLY_2Y = [
  4800, 5200, 5000, 5600, 6100, 5900, 6500, 6900, 6700, 7400, 7100, 7800,
  ...MONTHLY,
];
export const trafficData2y = expandMonthly(MONTHLY_2Y, 4);

const VISIBILITY_MONTHLY_2Y = [
  16, 18, 17, 20, 22, 21, 24, 26, 25, 28, 27, 29,
  ...VISIBILITY_MONTHLY,
];
export const visibilityData2y = expandMonthly(VISIBILITY_MONTHLY_2Y, 4);

const TRAFFIC_TABS = [
  { key: "traffic" as const, label: "Trafic mensuel" },
  { key: "visibility" as const, label: "Indice de visibilité" },
];

const PERIODS = [
  { key: "1y" as const, label: "1 an" },
  { key: "2y" as const, label: "2 ans" },
];

/** En-tête à onglets (Trafic mensuel / Indice de visibilité Ahrefs) + courbe associée. */
export function TrafficCard() {
  const [tab, setTab] = useState<"traffic" | "visibility">("traffic");
  const [period, setPeriod] = useState<"1y" | "2y">("1y");

  const is2y = period === "2y";
  const months = is2y ? MONTHS_2Y : MONTHS;
  const rows = is2y ? positionRows2y : positionRows;
  const traffic = is2y ? trafficData2y : trafficData;
  const visibility = is2y ? visibilityData2y : visibilityData;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 md:px-4 md:py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {TRAFFIC_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
                tab === t.key
                  ? "bg-accent-pink/[0.12] text-accent-pink"
                  : "text-text-muted hover:text-text-primary"
              }`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center gap-1 rounded-full border border-border-subtle bg-card-inner-bg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-200 ${
                period === p.key ? "bg-bg-card text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"
              }`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-border-subtle px-4 pb-4 pt-3 md:px-5">
        <TrafficChart values={tab === "traffic" ? traffic : visibility} months={months} rows={rows} showPositions={tab === "visibility"} />
        <InsightNote className="mt-3">
          {tab === "traffic" ? (
            <>Le <span className="font-medium text-text-primary">trafic mensuel</span> correspond aux visites organiques estimées depuis Google sur les {is2y ? "24" : "12"} derniers mois.</>
          ) : (
            <>L&apos;<span className="font-medium text-text-primary">indice de visibilité</span> (source Ahrefs, 0-100) reflète la part de clics potentiels que vous captez sur l&apos;ensemble de vos mots-clés suivis. Le tableau « Positions » détaille l&apos;évolution de vos mots-clés dans le top 3 à 100.</>
          )}
        </InsightNote>
      </div>
    </>
  );
}

function fmt(v: number) {
  return v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")} k` : String(v);
}

export const positionRows = [
  { label: "Top 3",   data: [12,  14,  13,  15,  17,  16,  18,  19,  18,  21,  20,  23]  },
  { label: "Top 10",  data: [38,  41,  39,  43,  47,  45,  51,  54,  52,  58,  55,  62]  },
  { label: "Top 50",  data: [124, 131, 128, 138, 149, 145, 158, 167, 162, 176, 170, 189] },
  { label: "Top 100", data: [241, 256, 249, 268, 287, 281, 304, 318, 311, 337, 329, 358] },
];

export const positionRows2y = [
  { label: "Top 3",   data: [6,   7,   7,   8,   9,   9,   10,  11,  10,  12,  11,  13,  12,  14,  13,  15,  17,  16,  18,  19,  18,  21,  20,  23]  },
  { label: "Top 10",  data: [22,  24,  23,  26,  28,  27,  30,  32,  31,  34,  33,  36,  38,  41,  39,  43,  47,  45,  51,  54,  52,  58,  55,  62]  },
  { label: "Top 50",  data: [78,  84,  81,  90,  97,  95,  104, 110, 107, 116, 113, 120, 124, 131, 128, 138, 149, 145, 158, 167, 162, 176, 170, 189] },
  { label: "Top 100", data: [150, 162, 156, 170, 182, 178, 195, 206, 200, 215, 210, 228, 241, 256, 249, 268, 287, 281, 304, 318, 311, 337, 329, 358] },
];

export function PositionsTable() {
  const W = 616;
  const pad = { l: 56, r: 8 };
  const gW = W - pad.l - pad.r;
  const labelPct = `${(pad.l / W * 100).toFixed(4)}%`;
  const rightPct = `${(pad.r / W * 100).toFixed(4)}%`;
  const gridCols = `${labelPct} repeat(12, 1fr) ${rightPct}`;

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-card-inner-bg">
      <div style={{ display: "grid", gridTemplateColumns: gridCols }}>
        <div className="border-b border-border-subtle/40 py-2.5 pr-2 text-right text-[8.5px] font-semibold uppercase tracking-[0.6px] text-text-muted/60" />
        {MONTHS.map((m) => (
          <div key={m} className="border-b border-border-subtle/40 py-2.5 text-center text-[8.5px] font-medium text-text-muted/60">{m}</div>
        ))}
        <div className="border-b border-border-subtle/40" />
        {positionRows.map((row, rowIdx) => (
          <Fragment key={row.label}>
            <div className={`py-4 px-4 text-right text-[12px] font-medium text-text-muted ${rowIdx > 0 ? "border-t border-border-subtle/25" : ""}`}
              style={{ backgroundColor: "var(--label-col-bg)" }}>
              {row.label}
            </div>
            {row.data.map((v, colIdx) => {
              const delta = colIdx > 0 ? v - row.data[colIdx - 1] : null;
              return (
                <div key={colIdx} className={`py-4 text-center text-[12px] tabular-nums text-text-secondary ${rowIdx > 0 ? "border-t border-border-subtle/25" : ""}`}>
                  {v}
                  {delta !== null && (
                    <div className={`mt-0.5 text-[8px] tabular-nums font-medium ${delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-text-muted"}`}>
                      {delta > 0 ? `+${delta}` : delta}
                    </div>
                  )}
                </div>
              );
            })}
            <div className={rowIdx > 0 ? "border-t border-border-subtle/25" : ""} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function TrafficChart({ values, months = MONTHS, rows = positionRows, showPositions = true }: { values: number[]; months?: string[]; rows?: { label: string; data: number[] }[]; showPositions?: boolean }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [posOpen, setPosOpen] = useState(false);
  const W = 616;
  const H = 180;
  const pad = { t: 14, r: 8, b: 28, l: 56 };
  const gW = W - pad.l - pad.r; // 552 — same chart width as before
  const gH = H - pad.t - pad.b;
  const n = values.length;
  const pts = Math.max(1, Math.round((n - 1) / months.length)); // points par mois (4)
  const monthFont = months.length > 12 ? 6 : 7.5;

  const minV = Math.min(...values) * 0.85;
  const maxV = Math.max(...values) * 1.05;

  const x = (i: number) => pad.l + (i / (n - 1)) * gW;
  const y = (v: number) => pad.t + gH - ((v - minV) / (maxV - minV)) * gH;

  function monotonePath(vals: number[]) {
    const xs = vals.map((_, i) => x(i));
    const ys = vals.map((v) => y(v));
    const n2 = vals.length;
    const dx = xs.map((v, i) => i < n2 - 1 ? xs[i + 1] - v : 0);
    const dy = ys.map((v, i) => i < n2 - 1 ? ys[i + 1] - v : 0);
    const m = ys.map((_, i) => {
      if (i === 0) return dy[0] / dx[0];
      if (i === n2 - 1) return dy[n2 - 2] / dx[n2 - 2];
      return (dy[i - 1] / dx[i - 1] + dy[i] / dx[i]) / 2;
    });
    for (let i = 0; i < n2 - 1; i++) {
      if (dy[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / (dy[i] / dx[i]);
      const b = m[i + 1] / (dy[i] / dx[i]);
      const s = a * a + b * b;
      if (s > 9) { const t = 3 / Math.sqrt(s); m[i] *= t; m[i + 1] *= t; }
    }
    let d = `M ${xs[0]},${ys[0]}`;
    for (let i = 0; i < n2 - 1; i++) {
      const h = dx[i];
      d += ` C ${xs[i] + h / 3},${ys[i] + (m[i] * h) / 3} ${xs[i + 1] - h / 3},${ys[i + 1] - (m[i + 1] * h) / 3} ${xs[i + 1]},${ys[i + 1]}`;
    }
    return d;
  }

  const linePath = monotonePath(values);
  const areaPath = `${linePath} L ${x(n - 1)},${H - pad.b} L ${x(0)},${H - pad.b} Z`;

  const gridVals = [
    Math.round(minV + (maxV - minV) * 0.25),
    Math.round(minV + (maxV - minV) * 0.6),
    Math.round(maxV * 0.98),
  ];

  const hoverMonth = hoverIdx !== null ? Math.floor(hoverIdx / pts) : null;

  // CSS grid proportionnelle au SVG : colonne label + N mois + padding droit.
  const labelPct = `${(pad.l / W * 100).toFixed(4)}%`;
  const rightPct = `${(pad.r / W * 100).toFixed(4)}%`;
  const gridCols = `${labelPct} repeat(${months.length}, 1fr) ${rightPct}`;

  return (
    <div className="relative w-full" onMouseLeave={() => setHoverIdx(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }}>
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4dcb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ec4dcb" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid */}
        {gridVals.map((v) => (
          <g key={v}>
            <line x1={pad.l} y1={y(v)} x2={W - pad.r} y2={y(v)} stroke="var(--border-subtle)" strokeWidth={0.5} strokeDasharray="3 4" />
            <text x={pad.l - 4} y={y(v)} textAnchor="end" dominantBaseline="central" fill="var(--text-muted)" fontSize={7.5}>{fmt(v)}</text>
          </g>
        ))}

        {/* month labels centered on each column: x(i*pts + pts/2) = midpoint of each monthly interval */}
        {months.map((m, i) => (
          <text key={i} x={x(i * pts + Math.floor(pts / 2))} y={H - 5} textAnchor="middle" fill="var(--text-muted)" fontSize={monthFont}>{m}</text>
        ))}

        {/* area fill */}
        <path d={areaPath} fill="url(#tg)" />

        {/* line */}
        <path d={linePath} fill="none" stroke="#ec4dcb" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />

        {/* hover line */}
        {hoverIdx !== null && (
          <line x1={x(hoverIdx)} y1={pad.t} x2={x(hoverIdx)} y2={H - pad.b} stroke="var(--border-subtle)" strokeWidth={1} />
        )}

        {/* dot — hover only */}
        {hoverIdx !== null && (
          <circle cx={x(hoverIdx)} cy={y(values[hoverIdx])} r={4} fill="white" stroke="none" />
        )}

        {/* hover targets — one per data point */}
        {values.map((_, i) => (
          <rect key={i} x={x(i) - gW / (2 * (n - 1))} y={pad.t} width={gW / (n - 1)} height={gH}
            fill="transparent" onMouseEnter={() => setHoverIdx(i)} style={{ cursor: "crosshair" }}
          />
        ))}
      </svg>

      {/* Position table — uniquement sur l'indice de visibilité */}
      {showPositions && (
      <div className="mt-3 overflow-hidden rounded-xl border border-border-subtle bg-card-inner-bg">
        <button
          className="flex w-full items-center justify-between px-5 py-4"
          onClick={() => setPosOpen((v) => !v)}
        >
          <span className="text-[14px] font-medium text-text-primary">Positions</span>
          <svg
            className={`h-4 w-4 text-text-muted transition-transform duration-300 ${posOpen ? "rotate-180" : ""}`}
            style={{ transitionTimingFunction: "var(--ease-out)" }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        <div
          className="grid transition-[grid-template-rows] duration-300"
          style={{ gridTemplateRows: posOpen ? "1fr" : "0fr", transitionTimingFunction: "var(--ease-out)" }}
        >
          <div className="overflow-hidden">
            <div className="border-t border-border-subtle/50 p-3" style={{ display: "grid", gridTemplateColumns: gridCols }}>
              {rows.map((row, rowIdx) => (
                <Fragment key={row.label}>
                  <div className={`py-4 px-4 text-right text-[12px] font-medium text-text-muted ${
                    rowIdx > 0 ? "border-t border-border-subtle/25" : ""
                  }`}>
                    {row.label}
                  </div>
                  {row.data.map((v, colIdx) => {
                    const delta = colIdx > 0 ? v - row.data[colIdx - 1] : null;
                    return (
                      <div
                        key={colIdx}
                        className={`py-4 text-center text-[12px] tabular-nums transition-all duration-150 ${
                          rowIdx > 0 && hoverMonth !== colIdx ? "border-t border-border-subtle/25" : rowIdx > 0 ? "border-t border-transparent" : ""
                        } ${
                          hoverMonth === colIdx
                            ? `font-semibold text-text-primary ${rowIdx === 0 ? "rounded-t-lg" : ""} ${rowIdx === rows.length - 1 ? "rounded-b-lg" : ""}`
                            : "text-text-secondary"
                        }`}
                        style={hoverMonth === colIdx ? { backgroundColor: "var(--label-col-bg)" } : undefined}
                      >
                        {v}
                        {delta !== null && (
                          <div className={`mt-0.5 text-[8px] tabular-nums font-medium ${
                            delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-text-muted"
                          }`}>
                            {delta > 0 ? `+${delta}` : delta}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className={rowIdx > 0 ? "border-t border-border-subtle/25" : ""} />
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* tooltip */}
      {hoverIdx !== null && (
        <div
          className="pointer-events-none absolute top-4 z-20 rounded-lg border border-border-subtle bg-[var(--tooltip-bg)] px-3 py-2 shadow-lg"
          style={{
            left: `${(hoverIdx / (n - 1)) * 100}%`,
            transform: hoverIdx > n / 2 ? "translateX(-110%)" : "translateX(8px)",
          }}
        >
          <p className="text-[11px] font-medium text-text-muted">{monthWithYear(months, Math.floor(hoverIdx / pts))}</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-text-primary">
            {values[hoverIdx].toLocaleString("fr-FR")} visites
          </p>
        </div>
      )}
    </div>
  );
}

/** Conservé dans le design system (ancien rendu en roue interactive au survol). */
export function getSegments(scores: typeof mobileScores) {
  return scores.map((s) => ({
    label: s.label,
    score: s.score,
    color:
      s.score >= 90
        ? "#22c55e"
        : s.score >= 50
          ? "#f59e0b"
          : "#ef4444",
  }));
}

export function ScoreWheel({ score, segments }: { score: number; segments: ReturnType<typeof getSegments> }) {
  const [hovered, setHovered] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const innerR = 54;
  const outerR = 68;
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;

  const innerC = 2 * Math.PI * innerR;
  const outerC = 2 * Math.PI * outerR;

  const mainColor =
    score >= 90 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const mainOffset = innerC - (score / 100) * innerC;

  const gapPx = 10;
  const quarterLen = outerC / 4;
  const segAvailable = quarterLen - gapPx;

  const tooltipPositions = segments.map((_, i) => {
    const angle = (i * 90 + 45 - 90) * (Math.PI / 180);
    const tr = outerR + 36;
    return {
      x: cx + Math.cos(angle) * tr,
      y: cy + Math.sin(angle) * tr,
    };
  });

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActiveIdx(null); }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Inner ring — background track */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="var(--card-inner-border)" strokeWidth={7} />
        {/* Inner ring — main score arc */}
        <circle
          cx={cx} cy={cy} r={innerR}
          fill="none" stroke={mainColor} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={innerC}
          strokeDashoffset={visible ? mainOffset : innerC}
          opacity={hovered ? 0.2 : 1}
          style={{ transition: "stroke-dashoffset 1.2s var(--ease-in-out), opacity 0.3s var(--ease-out)" }}
        />

        {/* Outer ring — 4 separate quarter arcs with visible gaps */}
        {segments.map((seg, i) => {
          const filled = (seg.score / 100) * segAvailable;
          const gapAngle = (gapPx / outerC) * 360;
          const rotation = i * 90 + gapAngle / 2;
          const isActive = activeIdx === i;

          return (
            <g key={i}>
              {/* Quarter background track */}
              <circle
                cx={cx} cy={cy} r={outerR}
                fill="none"
                stroke="var(--card-inner-border)"
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={`${segAvailable} ${outerC - segAvailable}`}
                opacity={hovered ? 0.5 : 0}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: "opacity 0.3s var(--ease-out)",
                }}
              />
              {/* Quarter filled arc */}
              <circle
                cx={cx} cy={cy} r={outerR}
                fill="none"
                stroke={seg.color}
                strokeWidth={isActive ? 9 : 7}
                strokeLinecap="round"
                strokeDasharray={`${filled} ${outerC - filled}`}
                opacity={hovered ? (activeIdx !== null && !isActive ? 0.2 : 1) : 0}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: "opacity 0.3s var(--ease-out), stroke-width 0.2s var(--ease-out)",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              />
            </g>
          );
        })}

        {/* Center text */}
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="central"
          className="rotate-90 font-bold"
          style={{
            transformOrigin: "center",
            fill: activeIdx !== null ? segments[activeIdx].color : "var(--text-primary)",
            fontSize: 30,
            transition: "fill 0.2s",
          }}
        >
          {activeIdx !== null ? segments[activeIdx].score : score}
        </text>
      </svg>

      {/* Tooltips — all 4 visible on hover */}
      {hovered && tooltipPositions.map((pos, i) => {
        const onLeftSide = i >= 2;
        return (
          <div
            key={i}
            className="pointer-events-none absolute z-10"
            style={
              onLeftSide
                ? { right: size - pos.x, top: pos.y, transform: "translateY(-50%)" }
                : { left: pos.x, top: pos.y, transform: "translateY(-50%)" }
            }
          >
            <div
              className="flex flex-col items-start rounded-lg border border-border-subtle bg-[var(--tooltip-bg)] px-3 py-1.5 shadow-lg"
              style={{
                animation: "fade-up 150ms var(--ease-out) both",
                animationDelay: `${i * 40}ms`,
                opacity: activeIdx !== null && activeIdx !== i ? 0.3 : 1,
                transition: "opacity 0.2s var(--ease-out)",
              }}
            >
              <span className="text-[13px] font-medium text-text-primary whitespace-nowrap">
                {segments[i].label}
              </span>
              <span
                className="text-[14px] font-bold tabular-nums"
                style={{ color: segments[i].color }}
              >
                {segments[i].score}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PageSpeedCard() {
  const [device, setDevice] = useState<DeviceType>("mobile");
  const [activeInfo, setActiveInfo] = useState<(typeof mobileScores)[number] | null>(null);
  const data = deviceData[device];

  return (
    <>
      {activeInfo && (
        <ScoreInfoModal
          info={activeInfo.info}
          icon={activeInfo.icon}
          onClose={() => setActiveInfo(null)}
        />
      )}

      <section
        className="relative z-10"
        style={{ animationDelay: "0ms" }}
      >
        {/* Tabs row — device switch */}
        <div className="flex items-center px-5 pt-4 md:px-6">
          {/* Device tabs */}
          <div className="flex gap-0">
            <button
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-[14px] font-medium transition-all duration-200 ${
                device === "mobile"
                  ? "border-accent-pink text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              Mobile
            </button>
            <button
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-[14px] font-medium transition-all duration-200 ${
                device === "desktop"
                  ? "border-accent-pink text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
              </svg>
              Bureau
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 px-5 pb-4 pt-3 md:px-6 md:pb-5">
          {/* 4 scores Lighthouse — affichés directement (cf. "Voir plus") */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {data.scores.map((s) => (
              <div
                key={s.label}
                className="relative flex flex-col items-center gap-1.5 rounded-xl border border-card-inner-border bg-card-inner-bg px-3 py-4"
              >
                {/* Info "i" du score */}
                <button
                  onClick={() => setActiveInfo(s)}
                  aria-label={`Détails du score ${s.label}`}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border-subtle bg-bg-card text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
                  </svg>
                </button>

                <ScoreArc score={s.score} size={108} valueClassName="text-[20px]" />
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <span className="text-text-primary/70">{s.icon}</span>
                  <span className="text-center text-[11px] font-medium">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Performance du site — Core Web Vitals */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-text-primary/80">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
              </span>
              <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
                Performance du site
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.stats.map((s) => {
                const tip = statTooltips[s.label];
                return (
                  <div
                    key={s.label}
                    className="group relative flex items-center gap-2 rounded-lg border border-card-inner-border bg-card-inner-bg px-3 py-1.5"
                  >
                    <span className="text-[11px] font-medium text-text-muted">{s.label}</span>
                    <span className={`text-[13px] font-semibold tabular-nums ${s.color}`}>{s.value}</span>
                    {tip && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-lg border border-border-subtle bg-[var(--tooltip-bg)] px-4 py-3 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100"
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      >
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-subtle" />
                        <p className="text-[13px] font-medium text-text-primary">{tip.name}</p>
                        <p className="mt-1 text-[12px] font-light leading-relaxed text-text-secondary">{tip.desc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <InsightNote className="mt-1">
              Ces métriques (Core Web Vitals) mesurent la vitesse et la stabilité de chargement réelles de votre page sur {device === "mobile" ? "mobile" : "ordinateur"}. Elles pèsent directement sur l&apos;expérience utilisateur et sur votre classement Google.
            </InsightNote>
          </div>
        </div>

      </section>
    </>
  );
}
