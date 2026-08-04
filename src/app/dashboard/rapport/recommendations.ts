export type Pillar = "SEO Technique" | "SEO Sémantique" | "GEO" | "Autorité";
export type Priority = "P1" | "P2" | "P3";
export type Effort = "Faible" | "Moyen" | "Élevé";

export interface Recommendation {
  /** Wording marché : phrase claire et compréhensible (titre de carte). */
  title: string;
  /** Constat technique issu de l'audit (secondaire). */
  observation: string;
  /** Action à mener (encart gris). */
  action: string;
  /** Gain estimé. */
  gain: string;
  pillar: Pillar;
  priority: Priority;
  effort: Effort;
  awiAngle: string;
  /** @deprecated alias historique = action (rendus legacy). */
  text: string;
}

const make = (r: Omit<Recommendation, "text">): Recommendation => ({ ...r, text: r.action });

export const recommendations: Recommendation[] = [
  make({
    title: "Accélérez vos pages les plus stratégiques",
    observation: "Le LCP atteint 3,2 s sur vos pages catégories prioritaires (seuil recommandé : 2,5 s).",
    action: "Optimiser le rendu critique et différer les ressources bloquantes (JS/CSS) sur les templates catégories.",
    gain: "LCP sous 2,5 s, +18 % de trafic organique sur les pages catégories",
    pillar: "SEO Technique",
    priority: "P1",
    effort: "Moyen",
    awiAngle: "Audit performance + accompagnement dev pour optimiser le rendu critique et les ressources bloquantes.",
  }),
  make({
    title: "Reliez mieux vos contenus piliers entre eux",
    observation: "Vos « cornerstone content » reçoivent peu de liens internes thématiques.",
    action: "Construire des clusters sémantiques et renforcer le maillage interne vers les pages piliers.",
    gain: "+12 positions moyennes sur vos mots-clés longue traîne stratégiques",
    pillar: "SEO Sémantique",
    priority: "P1",
    effort: "Moyen",
    awiAngle: "Cartographie sémantique + plan de maillage piloté par nos consultants éditoriaux.",
  }),
  make({
    title: "Rendez votre marque visible dans les réponses IA",
    observation: "Votre présence est faible dans les réponses génératives (ChatGPT, Perplexity, SGE).",
    action: "Déployer des schémas JSON-LD avancés et structurer le contenu pour les moteurs de réponse.",
    gain: "+47 % de visibilité dans les réponses IA génératives",
    pillar: "GEO",
    priority: "P1",
    effort: "Moyen",
    awiAngle: "Implémentation schema.org + monitoring de présence dans les SERP IA via notre suite GEO.",
  }),
  make({
    title: "Débloquez l'indexation mobile de vos pages",
    observation: "Plusieurs ressources critiques sont bloquées par le robots.txt en Mobile-First.",
    action: "Auditer l'indexation Search Console et arbitrer les règles du robots.txt.",
    gain: "+340 pages réindexées, ~2 100 visites/mois récupérées",
    pillar: "SEO Technique",
    priority: "P2",
    effort: "Faible",
    awiAngle: "Diagnostic d'indexation Search Console + arbitrage robots.txt en 2 jours-homme.",
  }),
  make({
    title: "Capturez les extraits enrichis dans Google",
    observation: "Vos pages produits n'exposent pas les données structurées attendues pour les rich snippets.",
    action: "Générer le balisage Product / FAQ / Breadcrumb et valider via le test des résultats enrichis.",
    gain: "Taux de clic en hausse estimée de +9 % sur les requêtes transactionnelles",
    pillar: "SEO Technique",
    priority: "P2",
    effort: "Faible",
    awiAngle: "Implémentation et QA des données structurées par nos intégrateurs SEO.",
  }),
  make({
    title: "Récupérez l'autorité perdue par vos pages orphelines",
    observation: "Des pages orphelines et des URLs cannibalisées dispersent votre « link juice ».",
    action: "Nettoyer les pages orphelines et rediriger (301) les URLs cannibalisées vers les pages de conversion.",
    gain: "Consolidation du link juice, +8 points de Domain Authority estimés",
    pillar: "Autorité",
    priority: "P3",
    effort: "Faible",
    awiAngle: "Audit de cannibalisation + plan de redirection 301 livré clé en main.",
  }),
  make({
    title: "Couvrez les intentions de recherche manquantes",
    observation: "Plusieurs intentions clés de votre marché ne sont couvertes par aucune page dédiée.",
    action: "Produire des pages de contenu ciblant les intentions non couvertes identifiées au clustering.",
    gain: "Ouverture d'un potentiel de +6 500 recherches/mois adressables",
    pillar: "SEO Sémantique",
    priority: "P2",
    effort: "Élevé",
    awiAngle: "Brief éditorial + production de contenu optimisé par nos rédacteurs spécialisés.",
  }),
  make({
    title: "Gagnez des citations dans les médias de votre secteur",
    observation: "Votre profil de backlinks est en retard sur les médias d'autorité comparé aux concurrents.",
    action: "Lancer une campagne de relations presse digitale et de netlinking thématique ciblé.",
    gain: "+15 domaines référents qualifiés sur 90 jours",
    pillar: "Autorité",
    priority: "P2",
    effort: "Élevé",
    awiAngle: "Stratégie de netlinking et RP digitale opérée par notre cellule notoriété.",
  }),
  make({
    title: "Alignez votre contenu sur les questions posées aux IA",
    observation: "Vos contenus ne répondent pas explicitement aux questions fréquentes posées aux assistants IA.",
    action: "Ajouter des sections Q/R et des définitions sourcées pour devenir une source citée par les IA.",
    gain: "Citations en hausse dans les réponses ChatGPT / Perplexity sur vos thématiques",
    pillar: "GEO",
    priority: "P3",
    effort: "Moyen",
    awiAngle: "Optimisation GEO du contenu et suivi des citations IA via notre suite de monitoring.",
  }),
  make({
    title: "Corrigez les erreurs d'exploration qui freinent Google",
    observation: "Le crawl révèle des chaînes de redirection et des erreurs 4xx sur des pages à trafic.",
    action: "Résoudre les chaînes de redirection et les 4xx, et optimiser le budget de crawl.",
    gain: "Crawl plus efficace, meilleure fraîcheur d'indexation sur les pages clés",
    pillar: "SEO Technique",
    priority: "P3",
    effort: "Faible",
    awiAngle: "Audit de crawl technique + plan de correction priorisé.",
  }),
];
