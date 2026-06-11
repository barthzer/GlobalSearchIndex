export interface AnalyseScore {
  label: string;
  score: number | null; // null = non audité
  note?: string;
}

export const analyseScores: AnalyseScore[] = [
  { label: "SEO Technique", score: 79 },
  { label: "SEO Sémantique", score: null, note: "Non audité dans cette mission" },
  { label: "GEO", score: 62 },
  { label: "Autorité", score: 48 },
];

/** Détail GEO par moteur d'IA : citations relevées + nombre de pages mentionnées. */
export interface GeoModelScore {
  name: string;
  logo: string | null; // null → avatar initiale (pas de logo dispo)
  citations: number | null; // citations de la marque dans le moteur, null = non audité
  pages: number; // nombre de pages distinctes mentionnées
}

export const geoScore = 62;

/** Moteurs suivis, du plus important au moins important (les 3 derniers sont repliés par défaut). */
export const geoByModel: GeoModelScore[] = [
  { name: "ChatGPT", logo: "/chatgpt.png", citations: 48, pages: 31 },
  { name: "Google Mode IA", logo: "/google.svg", citations: 42, pages: 27 },
  { name: "Gemini", logo: "/gemini.png", citations: 35, pages: 22 },
  { name: "Perplexity", logo: "/perplexity.png", citations: 29, pages: 18 },
  { name: "Copilot", logo: "/copilot.svg", citations: 19, pages: 12 },
  { name: "Grok", logo: "/grok.svg", citations: 11, pages: 7 },
  { name: "AIO (recherche Google)", logo: "/gemini.png", citations: 8, pages: 5 },
];

export const pageSpeedScores = [
  { label: "Performances", score: 73 },
  { label: "Accessibilité", score: 85 },
  { label: "Bonnes pratiques", score: 78 },
  { label: "SEO", score: 92 },
];

export type PerfTier = "success" | "warning" | "danger";

export interface PerfStat {
  label: string;
  name: string;
  value: string;
  description: string;
  tier: PerfTier;
}

export const performanceStats: PerfStat[] = [
  {
    label: "FCP",
    name: "First Contentful Paint",
    value: "3,9 s",
    description: "Temps avant le premier affichage visible. Plus c'est rapide, plus l'utilisateur voit vite du contenu.",
    tier: "danger",
  },
  {
    label: "LCP",
    name: "Largest Contentful Paint",
    value: "4,4 s",
    description: "Temps de chargement de l'élément principal (image, titre). Doit rester sous 2,5 s pour une bonne expérience.",
    tier: "danger",
  },
  {
    label: "TBT",
    name: "Total Blocking Time",
    value: "0 ms",
    description: "Durée pendant laquelle la page ne répond pas aux clics. Un TBT bas signifie une page réactive.",
    tier: "success",
  },
  {
    label: "CLS",
    name: "Cumulative Layout Shift",
    value: "0",
    description: "Mesure les décalages visuels inattendus. Un CLS de 0 signifie que rien ne bouge pendant le chargement.",
    tier: "success",
  },
  {
    label: "SI",
    name: "Speed Index",
    value: "5,1 s",
    description: "Vitesse d'affichage global du contenu. Plus l'indice est bas, plus le contenu apparaît vite à l'écran.",
    tier: "warning",
  },
];

const audited = analyseScores.filter((s): s is AnalyseScore & { score: number } => s.score !== null);
export const globalScore = Math.round(
  audited.reduce((acc, s) => acc + s.score, 0) / Math.max(1, audited.length)
);
