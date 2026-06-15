"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import CompanyLogo from "@/components/CompanyLogo";
import ScoreArc from "@/components/ScoreArc";
import GeoScoreCard from "@/components/GeoScoreCard";
import SEOEngineModal from "@/components/SEOEngineModal";
import ExpertModal from "@/components/ExpertModal";
import AWILogo from "@/components/AWILogo";
import GenerationsSidebar from "@/components/GenerationsSidebar";
import ProcessingBanner from "@/components/ProcessingBanner";
import TutorialModal, { tourSeen } from "@/components/TutorialModal";
import PageSpeedCard, { TrafficChart, trafficData } from "@/components/PageSpeedCard";
import ProjectionView from "@/components/ProjectionView";
import ConcurrenceView, { CoverageSection } from "@/components/ConcurrenceView";
import NotorieteView from "@/components/NotorieteView";
import { useAccount } from "@/components/AccountProvider";
import { useGeneration } from "@/components/GenerationProvider";
import { recommendations } from "./rapport/recommendations";
import { tabsForRole, defaultTabForRole, type TabKey } from "@/lib/tabs";
import RecommendationsView from "@/components/RecommendationsView";
import RecommendationCard from "@/components/RecommendationCard";
import { NotorieteInsights } from "@/components/NotorieteView";

const priorityConfig = {
  critique: { label: "Critique", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/20" },
  important: { label: "Important", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/20" },
  moyen: { label: "Moyen", bg: "bg-blue-400/15", text: "text-blue-400", border: "border-blue-400/20" },
};

const categoryIcons: Record<string, React.ReactNode> = {
  performance: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  maillage: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  ),
  indexation: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  schema: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  ),
  redirection: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
};

function CriterionIcon({ d }: { d: string }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const scoreInfos = {
  technique: {
    title: "SEO Technique",
    heading: "Comment est calculé le score technique ?",
    intro: "Le score SEO technique mesure la capacité de votre site à être exploré, indexé et correctement interprété par les moteurs de recherche.",
    criteria: [
      { label: "Indexation des pages", description: "pages accessibles, absence de blocages (noindex, erreurs).", icon: <CriterionIcon d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /> },
      { label: "Exploration du site", description: "facilité de navigation pour les robots (crawl).", icon: <CriterionIcon d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" /> },
      { label: "Performance", description: "temps de chargement et Core Web Vitals.", icon: <CriterionIcon d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /> },
      { label: "Structure du site", description: "maillage interne et profondeur des pages.", icon: <CriterionIcon d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" /> },
      { label: "Qualité du code HTML", description: "balises (title, Hn, meta) bien structurées.", icon: <CriterionIcon d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /> },
      { label: "Erreurs techniques", description: "pages cassées, redirections, anomalies serveur.", icon: <CriterionIcon d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /> },
    ],
    conclusion: "Ce score reflète la santé technique globale de votre site et son potentiel d'indexation.",
  },
  semantique: {
    title: "SEO Sémantique",
    heading: "Comment est calculé le score sémantique ?",
    intro: "Le score sémantique mesure votre capacité à vous positionner sur des mots-clés stratégiques face à vos concurrents.",
    criteria: [
      { label: "Positionnement sur les mots-clés", description: "classement de vos pages sur les requêtes ciblées.", icon: <CriterionIcon d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" /> },
      { label: "Performance concurrentielle", description: "comparaison avec des sites concurrents.", icon: <CriterionIcon d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /> },
      { label: "Pertinence des contenus", description: "adéquation entre vos pages et les intentions de recherche.", icon: <CriterionIcon d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /> },
      { label: "Couverture sémantique", description: "richesse et profondeur des sujets traités.", icon: <CriterionIcon d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /> },
      { label: "Visibilité globale", description: "capacité à capter du trafic sur ces thématiques.", icon: <CriterionIcon d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /> },
    ],
    conclusion: "Ce score reflète votre compétitivité SEO sur les requêtes qui comptent vraiment pour votre business.",
  },
  geo: {
    title: "GEO",
    heading: "Comment est calculé le score GEO ?",
    intro: "Le score GEO mesure la capacité d'une page à être comprise, extraite et citée par les moteurs d'IA générative (ChatGPT, Perplexity, Google AI Overviews).",
    criteria: [
      { label: "Clarté du contenu", description: "réponses directes, paragraphes courts.", icon: <CriterionIcon d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" /> },
      { label: "Données structurées", description: "balises schema.org (FAQ, HowTo…).", icon: <CriterionIcon d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /> },
      { label: "Structure extractible", description: "listes, tableaux, formats lisibles.", icon: <CriterionIcon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /> },
      { label: "Formats pédagogiques", description: "FAQ, guides étape par étape.", icon: <CriterionIcon d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /> },
      { label: "Crédibilité du contenu", description: "sources, chiffres, signaux E-E-A-T.", icon: <CriterionIcon d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /> },
      { label: "Organisation", description: "structure claire facilitant l'extraction.", icon: <CriterionIcon d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" /> },
    ],
    conclusion: "Optimiser ces éléments améliore votre visibilité dans les réponses générées par l'IA.",
  },
  autorite: {
    title: "Autorité",
    heading: "Comment est calculé le score d'autorité ?",
    intro: "Le score d'autorité mesure la crédibilité et la popularité de votre site dans l'écosystème web.",
    criteria: [
      { label: "Backlinks", description: "nombre de liens pointant vers votre site.", icon: <CriterionIcon d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /> },
      { label: "Qualité des liens", description: "fiabilité et autorité des sites sources.", icon: <CriterionIcon d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /> },
      { label: "Domaines référents", description: "diversité des sites qui vous citent.", icon: <CriterionIcon d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /> },
      { label: "Popularité globale", description: "présence et visibilité de votre site en ligne.", icon: <CriterionIcon d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /> },
      { label: "Cohérence du netlinking", description: "équilibre et naturalité du profil de liens.", icon: <CriterionIcon d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /> },
    ],
    conclusion: "Ce score reflète le niveau de confiance que les moteurs de recherche accordent à votre site.",
  },
};

const scores = [
  {
    label: "SEO Technique",
    score: 79,
    recommendations: 32,
    info: scoreInfos.technique,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    label: "SEO Sémantique",
    score: 0,
    recommendations: 0,
    locked: true,
    info: scoreInfos.semantique,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    label: "Autorité",
    score: 48,
    recommendations: 12,
    info: scoreInfos.autorite,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const { isAdmin, isLoggedIn, hydrated } = useAccount();
  const router = useRouter();
  const { selected: currentGeneration, collapsed } = useGeneration();

  // Pas de dashboard en déconnecté : on renvoie vers la landing une fois la session restaurée.
  useEffect(() => {
    if (hydrated && !isLoggedIn) router.replace("/");
  }, [hydrated, isLoggedIn, router]);
  const [showSEOEngine, setShowSEOEngine] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("analyse");
  const [psOpen, setPsOpen] = useState(false);
  const sidebarWidth = isAdmin ? (collapsed ? "80px" : "292px") : "0px";

  // L'onglet courant est validé contre les onglets disponibles pour le rôle :
  // au switch de compte, on retombe sur l'onglet par défaut si le tab n'existe plus.
  const roleTabs = tabsForRole(isAdmin);
  const activeTabSafe: TabKey = roleTabs.some((t) => t.key === activeTab)
    ? activeTab
    : defaultTabForRole(isAdmin);

  const [copied, setCopied] = useState(false);
  const reportUrl = `/dashboard/rapport?clientId=${currentGeneration.id}`;

  // Tutoriel d'accueil — affiché une seule fois pour le client (jamais pour l'admin).
  const [showTour, setShowTour] = useState(false);
  useEffect(() => {
    if (!isAdmin && !tourSeen()) setShowTour(true);
  }, [isAdmin]);

  // Au changement d'onglet, on remonte en haut (sinon la position de scroll de la vue
  // précédente est conservée — ex. on arrivait en bas du Plan d'action).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTabSafe]);

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        })
        .catch(() => {});
    }
  }

  function handleDownloadReport() {
    window.open(reportUrl, "_blank");
  }

  // Déconnecté : on n'affiche rien (la redirection vers la landing est en cours).
  if (hydrated && !isLoggedIn) return null;

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      {showSEOEngine && <SEOEngineModal onClose={() => setShowSEOEngine(false)} />}
      {showExpert && <ExpertModal onClose={() => setShowExpert(false)} />}
      {showTour && <TutorialModal onClose={() => setShowTour(false)} onFocusTab={setActiveTab} />}

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-bg-primary" />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      <Header onExpertClick={() => setShowExpert(true)} hideLogo={isAdmin} showProfile sidebarWidth={sidebarWidth} activeTab={activeTabSafe} onTabChange={setActiveTab} isAdmin={isAdmin} />

      <div className="relative z-[3] flex flex-1">
        {/* Sidebar — admin only */}
        {isAdmin && <GenerationsSidebar />}

        {/* Main content */}
        <main
          data-dashboard-main
          className="flex flex-1 flex-col px-4 pt-20 md:px-8 md:pt-24"
        >
          <style>{`@media (min-width: 1024px) { [data-dashboard-main] { margin-left: ${sidebarWidth}; } }`}</style>
          <div className="mx-auto flex w-full max-w-[1360px] gap-6 xl:gap-8" key={currentGeneration.id}>
            <div className="min-w-0 flex-1">

            {/* Bandeau d'attente — client uniquement */}
            {!isAdmin && <ProcessingBanner />}

            {/* Client badge + Title */}
            <section className="relative pb-8">
              <div className="animate-fade-up mb-5">
                <CompanyLogo name={currentGeneration.name} initial={currentGeneration.initial} />
              </div>
              <h1
                className="animate-fade-up text-2xl font-medium tracking-tight text-text-primary md:text-3xl"
                style={{ animationDelay: "60ms" }}
              >
                {activeTabSafe === "home"
                  ? "Vue d'ensemble"
                  : activeTabSafe === "analyse"
                    ? "Global Search Index"
                    : activeTabSafe === "projection"
                      ? "Projection Business"
                      : activeTabSafe === "concurrence"
                        ? "Analyse Concurrentielle"
                        : activeTabSafe === "recommandations"
                          ? "Plan d'action"
                          : "Présence Média & Réputation"}
              </h1>
              {activeTabSafe === "analyse" && (
                <p
                  className="animate-fade-up mt-2 max-w-lg text-[length:var(--text-body)] font-light text-text-secondary"
                  style={{ animationDelay: "120ms" }}
                >
                  Votre indice de visibilité global : SEO technique, sémantique, autorité et présence sur les moteurs d&apos;IA réunis en un seul score.
                </p>
              )}
              {activeTabSafe === "projection" && (
                <p
                  className="animate-fade-up mt-2 max-w-lg text-[length:var(--text-body)] font-light text-text-secondary"
                  style={{ animationDelay: "120ms" }}
                >
                  Estimez le CA généré par un gain de visibilité SEO selon votre secteur d&apos;activité.
                </p>
              )}
              {activeTabSafe === "concurrence" && (
                <p
                  className="animate-fade-up mt-2 max-w-lg text-[length:var(--text-body)] font-light text-text-secondary"
                  style={{ animationDelay: "120ms" }}
                >
                  Comparez votre présence SEO à celle de vos concurrents sur vos mots-clés stratégiques.
                </p>
              )}
              {activeTabSafe === "notoriete" && (
                <p
                  className="animate-fade-up mt-2 max-w-lg text-[length:var(--text-body)] font-light text-text-secondary"
                  style={{ animationDelay: "120ms" }}
                >
                  Diagnostic de l&apos;autorité média de la marque et calendrier éditorial construit autour des temps forts de votre secteur.
                </p>
              )}

              {/* Actions */}
              <div className="absolute right-0 top-0 flex items-center gap-3">
                {/* Client : deux boutons icône (partager / télécharger) avec tooltip */}
                {!isAdmin && (
                  <div className="flex items-center gap-2">
                    <IconAction
                      label={copied ? "Lien copié" : "Partager mon rapport"}
                      onClick={handleShare}
                    >
                      {copied ? (
                        <svg className="h-[18px] w-[18px] text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                        </svg>
                      )}
                    </IconAction>
                    <IconAction label="Télécharger mon rapport" onClick={handleDownloadReport}>
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </IconAction>
                  </div>
                )}

                {/* Admin : menu d'actions complet */}
                {isAdmin && (
                <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-card text-text-secondary transition-colors duration-150 hover:bg-bg-card-hover hover:text-text-primary"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                  </svg>
                </button>

                {showActions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                    <div
                      className="absolute right-0 top-11 z-20 w-48 origin-top-right rounded-xl border border-border-subtle bg-bg-card p-0.5 backdrop-blur-xl transition-all duration-200"
                      style={{
                        boxShadow: "0 12px 32px -4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
                        animation: "dropdown-in 200ms var(--ease-out) both",
                      }}
                    >
                      {[
                        {
                          label: "Partager",
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-12.814a2.25 2.25 0 1 0 0-2.186m0 2.186a2.246 2.246 0 0 1-.283-1.093c0-.397.103-.77.283-1.093m0 12.814a2.25 2.25 0 1 0 0 2.186m0-2.186a2.246 2.246 0 0 1-.283 1.093c0 .397.103.77.283 1.093" />
                            </svg>
                          ),
                          onClick: () => setShowActions(false),
                        },
                        {
                          label: "Générer le rapport client",
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                          ),
                          onClick: () => {
                            setShowActions(false);
                            window.open(`/dashboard/rapport?clientId=${currentGeneration.id}`, "_blank");
                          },
                        },
                        {
                          label: "Supprimer",
                          icon: (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          ),
                          danger: true,
                          onClick: () => setShowActions(false),
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors duration-150 ${
                            item.danger
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
                          }`}
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                </div>
                )}
              </div>
            </section>

            {activeTabSafe === "home" ? (
            <>
              {/* Trafic mensuel */}
              <div className="animate-fade-up mb-4 rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]" style={{ animationDelay: "300ms" }}>
                <div className="px-5 py-4 md:px-6">
                  <span className="text-[14px] font-medium text-text-primary">Trafic mensuel</span>
                </div>
                <div className="border-t border-border-subtle px-4 pb-4 pt-3 md:px-5">
                  <TrafficChart values={trafficData} />
                </div>
              </div>

              {/* Couverture top 10 */}
              <div className="animate-fade-up mb-4" style={{ animationDelay: "380ms" }}>
                <CoverageSection />
              </div>

              {/* Recommandations + sidebar */}
              <section className="mt-6 grid grid-cols-1 gap-6 pb-16 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <h2
                    className="animate-fade-up mb-6 text-xl font-medium tracking-tight text-text-primary"
                    style={{ animationDelay: "400ms" }}
                  >
                    Recommandations Stratégiques
                  </h2>
                  <div className="relative">
                    <div className="flex flex-col gap-3">
                      {recommendations.slice(0, 5).map((rec, i) => (
                        <RecommendationCard key={rec.title} rec={rec} index={i} delay={480 + i * 60} />
                      ))}
                    </div>
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
                      style={{ background: "linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%)" }}
                    />
                  </div>

                  <div className="mt-4 flex justify-center">
                    <div className="animate-fade-up" style={{ animationDelay: "800ms" }}>
                      <Button variant="tertiary" className="text-text-secondary" onClick={() => setShowSEOEngine(true)}>
                        Voir toutes les recommandations
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  <div
                    className="animate-fade-up relative mt-8 overflow-hidden rounded-2xl border border-[#ec4dcb]/20 p-6 md:p-8"
                    style={{
                      animationDelay: "860ms",
                      background: "linear-gradient(135deg, rgba(95,20,251,0.15) 0%, rgba(236,77,203,0.2) 100%)",
                    }}
                  >
                    <div className="mb-4 flex -space-x-2">
                      {["/consultant1.png", "/consultant2.png", "/consultant3.png"].map((src, i) => (
                        <img key={i} src={src} alt="Consultant" className="h-9 w-9 rounded-full border-2 border-bg-primary object-cover" />
                      ))}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-text-primary">Contactez un expert</h3>
                    <p className="mb-4 text-[length:var(--text-body)] font-extralight leading-relaxed text-text-secondary">
                      Discutez de vos résultats et obtenez des recommandations personnalisées pour accélérer votre visibilité.
                    </p>
                    <p className="mb-5 text-[12px] text-text-muted">+500 clients accompagnés</p>
                    <Button variant="primary" fullWidth onClick={() => setShowExpert(true)}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                      </svg>
                      Parler à un expert
                    </Button>
                  </div>
                </div>

                {/* RDV CTA sticky sidebar */}
                <div
                  className="animate-fade-up relative sticky top-6 self-start overflow-hidden rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]"
                  style={{
                    animationDelay: "500ms",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 40px -15px rgba(0,0,0,0.15)",
                  }}
                >
                  <div className="relative p-6 md:p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                      <svg className="h-5 w-5 text-accent-pink" viewBox="0 0 512 512" fill="currentColor">
                        <path d="m255.5 226.2c-16.9 0-30 13.1-29.9 29.8.3 16.8 13.9 30.2 30.7 30.3 16.2.1 29.3-13 29.4-29.2 0-.2 0-.4 0-.6.2-16.6-13-30.2-29.6-30.4-.2.1-.4.1-.6.1z"/>
                        <path d="m256 0c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256zm135.6 144.5c-21.8 56.1-43.9 112-65.8 168-2.2 6.1-6.9 10.8-12.9 13.1-56.1 22-112.3 44.1-168.4 66.2-1.9.7-3.8 1.2-5.7 1.6-15 .1-23.4-12.8-18.3-26 11-28.5 22.3-56.9 33.5-85.3 10.8-27.4 21.5-54.7 32.2-82.2 2.5-6.5 6.6-11.1 13.1-13.6 55.8-21.8 111.6-43.7 167.4-65.7 12.1-4.8 23.3 0 26 11.6.7 4.1.4 8.4-1.1 12.3z"/>
                      </svg>
                    </div>
                    <p className="text-[length:var(--text-body-lg)] font-medium leading-relaxed text-text-primary">
                      Ces 4 leviers montrent un potentiel de gain immédiat sur votre visibilité organique.
                    </p>
                    <p className="mt-3 text-[length:var(--text-body)] font-light leading-relaxed text-text-secondary">
                      Je vous propose un rendez-vous de 30 minutes pour cadrer un plan d&apos;action priorisé sur 90 jours et identifier les chantiers à lancer en premier.
                    </p>
                    <div className="mt-6">
                      <Button variant="primary" fullWidth onClick={() => setShowExpert(true)}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                        </svg>
                        Prendre RDV
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </>
            ) : activeTabSafe === "analyse" ? (
            <>
            {/* Encart GEO dédié — au-dessus des autres scores */}
            <div className="mb-4">
              <GeoScoreCard info={scoreInfos.geo} delay={280} />
            </div>

            {/* Score Cards */}
            <section className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scores.map((s, i) => (
                <ScoreArc key={s.label} {...s} delay={420 + i * 120} />
              ))}
            </section>

            {/* Google PageSpeed — accordion */}
            <div className="animate-fade-up mb-4 rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]" style={{ animationDelay: "480ms" }}>
              <button
                className="flex w-full items-center justify-between px-5 py-4 md:px-6"
                onClick={() => setPsOpen((v) => !v)}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                  </svg>
                  <span className="text-[14px] font-medium text-text-primary">Google PageSpeed Insights</span>
                </div>
                <svg
                  className="h-4 w-4 text-text-muted transition-transform duration-300"
                  style={{ transform: psOpen ? "rotate(180deg)" : "rotate(0deg)", transitionTimingFunction: "var(--ease-out)" }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300"
                style={{ gridTemplateRows: psOpen ? "1fr" : "0fr", transitionTimingFunction: "var(--ease-out)" }}
              >
                <div className={psOpen ? "" : "overflow-hidden"}>
                  <div className="border-t border-border-subtle">
                    <PageSpeedCard />
                  </div>
                </div>
              </div>
            </div>

            {/* Trafic mensuel */}
            <div className="animate-fade-up mb-4 rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-[6px]" style={{ animationDelay: "540ms" }}>
              <div className="px-5 py-4 md:px-6">
                <span className="text-[14px] font-medium text-text-primary">Trafic mensuel</span>
              </div>
              <div className="border-t border-border-subtle px-4 pb-4 pt-3 md:px-5">
                <TrafficChart values={trafficData} />
              </div>
            </div>

            {/* Notoriété & autorité — fusionnée dans Analyse pour le client */}
            {!isAdmin && (
              <section className="animate-fade-up mb-2 mt-8" style={{ animationDelay: "600ms" }}>
                <h2 className="mb-5 text-xl font-medium tracking-tight text-text-primary">
                  Notoriété &amp; autorité média
                </h2>
                <NotorieteInsights />
              </section>
            )}

            {/* Recommandations (pleine largeur) */}
            <section className="mt-6 pb-16">
              {/* Recommendations */}
              <div>
                <h2
                  className="animate-fade-up mb-6 text-xl font-medium tracking-tight text-text-primary"
                  style={{ animationDelay: "400ms" }}
                >
                  Recommandations Stratégiques
                </h2>
                <div className="relative">
                  <div className="flex flex-col gap-3">
                    {recommendations.slice(0, 5).map((rec, i) => (
                      <RecommendationCard key={rec.title} rec={rec} index={i} delay={480 + i * 60} />
                    ))}
                  </div>
                  {/* Fade mask over last recommendations */}
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
                    style={{ background: "linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%)" }}
                  />
                </div>

                <div className="mt-4 flex justify-center">
                  <div className="animate-fade-up" style={{ animationDelay: "800ms" }}>
                  <Button variant="tertiary" className="text-text-secondary" onClick={() => setActiveTab("recommandations")}>
                    Voir toutes les recommandations
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Button>
                  </div>
                </div>

                {/* Expert CTA card */}
                <div
                  className="animate-fade-up relative mt-8 overflow-hidden rounded-2xl border border-[#ec4dcb]/20 p-6 md:p-8"
                  style={{
                    animationDelay: "860ms",
                    background: "linear-gradient(135deg, rgba(95,20,251,0.15) 0%, rgba(236,77,203,0.2) 100%)",
                  }}
                >
                  <div className="mb-4 flex -space-x-2">
                    {["/consultant1.png", "/consultant2.png", "/consultant3.png"].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Consultant"
                        className="h-9 w-9 rounded-full border-2 border-bg-primary object-cover"
                      />
                    ))}
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-text-primary">
                    Contactez un expert
                  </h3>
                  <p className="mb-4 text-[length:var(--text-body)] font-extralight leading-relaxed text-text-secondary">
                    Discutez de vos résultats et obtenez des recommandations personnalisées pour accélérer votre visibilité.
                  </p>

                  {/* Social proof */}
                  <p className="mb-5 text-[12px] text-text-muted">
                    +500 clients accompagnés
                  </p>

                  <Button variant="primary" fullWidth onClick={() => setShowExpert(true)}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg>
                    Parler à un expert
                  </Button>
                </div>
              </div>
            </section>
            </>
            ) : activeTabSafe === "projection" ? (
              <ProjectionView />
            ) : activeTabSafe === "concurrence" ? (
              <ConcurrenceView />
            ) : activeTabSafe === "recommandations" ? (
              <RecommendationsView onExpertClick={() => setShowExpert(true)} />
            ) : (
              <NotorieteView />
            )}

            </div>

            {/* CTA expert sticky (client) — à droite du contenu, sur toutes les vues */}
            {!isAdmin && (
              <aside className="hidden shrink-0 xl:block xl:w-[264px]">
                <div
                  className="sticky top-3"
                  style={{ animation: "fade-up 600ms var(--ease-expo) both", animationDelay: "220ms" }}
                >
                  <div
                    className="overflow-hidden rounded-2xl border border-[#ec4dcb]/25 p-5"
                    style={{ background: "linear-gradient(160deg, rgba(95,20,251,0.12) 0%, rgba(236,77,203,0.16) 100%)" }}
                  >
                    <div className="mb-3 flex -space-x-2">
                      {["/consultant1.png", "/consultant2.png", "/consultant3.png"].map((src) => (
                        <img key={src} src={src} alt="Consultant" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
                      ))}
                    </div>
                    <h3 className="mb-1.5 text-[15px] font-semibold leading-snug text-text-primary">
                      Un expert à vos côtés
                    </h3>
                    <p className="mb-4 text-[13px] font-light leading-relaxed text-text-secondary">
                      Un consultant AWI décrypte vos résultats et bâtit votre plan d&apos;action sur-mesure.
                    </p>
                    <Button variant="primary" fullWidth onClick={() => setShowExpert(true)}>
                      Contactez un expert
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>

      <div data-dashboard-main>
        <Footer />
      </div>
    </div>
  );
}

/** Bouton icône avec tooltip accessible (hover + focus clavier). */
function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        aria-label={label}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-card text-text-secondary transition-colors duration-150 hover:bg-bg-card-hover hover:text-text-primary"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute right-0 top-11 z-30 whitespace-nowrap rounded-md border border-border-subtle bg-[var(--tooltip-bg)] px-2 py-1 text-[11px] font-medium text-text-primary opacity-0 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
    </div>
  );
}
