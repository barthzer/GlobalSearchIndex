export const authorityScore = 74;

export const backlinksData = {
  total: 1284,
  medias: 126,
  domains: 87,
  growth: "+18%",
};

export const majorMediaData = {
  mediasCount: 9,
  articlesCount: 42,
  pills: ["Le Figaro", "BFM Business", "Le Point", "Les Échos", "L'Usine Digitale"],
};

export const rankBenchmark = {
  rank: 3,
  total: 4,
  hint: "8 points sous Pennylane. Cible top 2 atteignable avec 3 émissions business + 2 tribunes d'expert d'ici 6 mois.",
};

export interface CompetitorRow {
  name: string;
  isYou?: boolean;
  backlinks: number;
  medias: number;
  presence: string;
  score: number;
}

export const competitorsTable: CompetitorRow[] = [
  { name: "Pennylane", backlinks: 2430, medias: 14, presence: "Les Échos, Le Figaro, BFM Business", score: 82 },
  { name: "Sage France", backlinks: 1760, medias: 11, presence: "La Tribune, Les Échos, L'Usine Digitale", score: 77 },
  { name: "Uplify Group", isYou: true, backlinks: 1284, medias: 9, presence: "Le Figaro, BFM Business, La Tribune", score: 74 },
  { name: "Qonto", backlinks: 890, medias: 5, presence: "BFM Business, Le Point, Capital", score: 61 },
];

export interface EditorialSlot {
  month: string;
  tag: string;
  title: string;
  description: string;
  media: string;
  // Identifiant du logo média (mappé sur public/MEDIAS/)
  mediaLogo: "lefigaro" | "bfm" | "lepoint" | "latribune";
  mediaSubtitle?: string;
}

export const editorialPlan: EditorialSlot[] = [
  {
    month: "Juin 2026",
    tag: "Priorité 1",
    title: "La facturation électronique : comment les entreprises doivent se préparer",
    description: "Positionner la marque comme expert réglementaire et partenaire de transformation pour les PME, juste avant l'entrée en vigueur.",
    media: "Le Figaro",
    mediaLogo: "lefigaro",
    mediaSubtitle: "Focus Business",
  },
  {
    month: "Juillet 2026",
    tag: "Notoriété",
    title: "Digitalisation des directions financières : les nouveaux standards du marché",
    description: "Créer un angle business autour de la productivité, du pilotage et de la conformité, en plein cycle de clôtures semestrielles.",
    media: "BFM Business",
    mediaLogo: "bfm",
    mediaSubtitle: "Décryptage",
  },
  {
    month: "Septembre 2026",
    tag: "Innovation",
    title: "IA et automatisation : les nouveaux leviers de performance des entreprises",
    description: "Associer la marque à l'innovation utile, concrète et mesurable, dans la dynamique de rentrée et des salons pro de l'automne.",
    media: "BFM Business",
    mediaLogo: "bfm",
    mediaSubtitle: "Grand Angle",
  },
  {
    month: "Octobre 2026",
    tag: "ROI",
    title: "Performance opérationnelle : comment gagner du temps sans perdre en contrôle",
    description: "Toucher une cible dirigeante avec un sujet orienté efficacité, pilotage et rentabilité en amont des budgets 2027.",
    media: "Le Point",
    mediaLogo: "lepoint",
    mediaSubtitle: "Objectif Performance",
  },
  {
    month: "Novembre 2026",
    tag: "Crédibilité",
    title: "Les entreprises françaises face aux nouveaux enjeux de conformité",
    description: "Renforcer la crédibilité sectorielle avec un angle économique et réglementaire, à la veille des arbitrages de fin d'année.",
    media: "La Tribune",
    mediaLogo: "latribune",
    mediaSubtitle: "La Tribune Business",
  },
  {
    month: "Décembre 2026",
    tag: "Expertise",
    title: "Tribune d'expert : les grandes tendances 2027 du secteur",
    description: "Installer la marque comme voix experte pour préparer les prises de parole de l'année suivante et capitaliser sur la rétrospective de fin d'année.",
    media: "La Tribune",
    mediaLogo: "latribune",
    mediaSubtitle: "Tribune d'expert",
  },
];
