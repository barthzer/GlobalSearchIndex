// Données de projection de CA — référentiel métier REPRIS À L'IDENTIQUE de la prod
// (apps/web/src/lib/projection-data.ts + logique de dérivation d'impressions
// portée depuis apps/web projection-view). 16 secteurs calibrés avec leur CTR
// benchmark réseau de recherche, scénarios (multiplicateurs de CTR), et dérivation
// des impressions depuis le trafic RÉEL des concurrents. Zéro valeur inventée :
// pas de sémantique → deriveImpressionsFromCompetitors renvoie null → empty state.

// ─────────────────────────────────────────────────────────────────────────────
// Secteurs d'activité
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectionSector {
  label: string;
  ctr: number; // CTR moyen sectoriel EN POURCENT (ex : 4.41 = 4.41 %)
  iconPath: string; // path SVG (heroicons outline) pour l'icône du secteur
}

export const sectors: ProjectionSector[] = [
  {
    label: 'Avocat',
    ctr: 4.41,
    iconPath:
      'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z',
  },
  {
    label: 'Auto',
    ctr: 4.0,
    iconPath:
      'M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
  },
  {
    label: 'B2B',
    ctr: 2.41,
    iconPath:
      'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0',
  },
  {
    label: 'Services aux consommateurs',
    ctr: 2.41,
    iconPath:
      'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
  },
  {
    label: 'Rencontres et personnes',
    ctr: 6.05,
    iconPath:
      'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z',
  },
  {
    label: 'Ecommerce',
    ctr: 2.69,
    iconPath:
      'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
  },
  {
    label: 'Education',
    ctr: 3.78,
    iconPath:
      'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342',
  },
  {
    label: "Services d'emploi",
    ctr: 2.42,
    iconPath:
      'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
  },
  {
    label: 'Finance & Assurance',
    ctr: 2.91,
    iconPath:
      'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z',
  },
  {
    label: 'Santé & Médical',
    ctr: 3.27,
    iconPath:
      'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z',
  },
  {
    label: 'Biens pour la maison',
    ctr: 2.44,
    iconPath:
      'm2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  {
    label: 'Services industriels',
    ctr: 2.61,
    iconPath:
      'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m0 0a2.678 2.678 0 0 1 .766-1.208l3.03-2.496M21 3l-2.25 2.25',
  },
  {
    label: 'Juridique',
    ctr: 2.93,
    iconPath:
      'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75',
  },
  {
    label: 'Immobilier',
    ctr: 3.71,
    iconPath:
      'M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M15.75 21H8.25m6.75-18.75h4.5m-4.5 0v3h4.5m-4.5-3L12 3m0 0L5.625 7.045M12 3v3.375m0 0L5.625 7.045M12 6.375v3.375m-6.375-2.705v10.08c0 .621.504 1.125 1.125 1.125H9.75',
  },
  {
    label: 'Technologie',
    ctr: 2.09,
    iconPath:
      'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z',
  },
  {
    label: 'Voyages et hôtellerie',
    ctr: 4.68,
    iconPath:
      'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Métadonnées des scénarios
// ─────────────────────────────────────────────────────────────────────────────

// Métadonnée statique d'un scénario. Les impressions (`imp`) et l'indice (`hint`)
// ne sont PAS ici : ils sont dérivés du trafic réel des concurrents et injectés
// par le composant (cf. deriveImpressionsFromCompetitors + fmtImpressionsHint).
export interface ProjectionScenarioMeta {
  tag: 'Pessimiste' | 'Réaliste' | 'Optimiste';
  name: string;
  ctrMul: number; // multiplicateur appliqué au CTR de base
  featured?: boolean;
}

// Ordre imposé : [pessimiste, réaliste, optimiste] — l'index sert à mapper les
// impressions dérivées (keys pessimistic/realistic/optimistic) dans le composant.
export const scenarioMeta: ProjectionScenarioMeta[] = [
  { tag: 'Pessimiste', name: 'Hypothèse basse', ctrMul: 0.7 },
  { tag: 'Réaliste', name: 'Hypothèse centrale', ctrMul: 1, featured: true },
  { tag: 'Optimiste', name: 'Hypothèse haute', ctrMul: 1.3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Dérivation des impressions depuis le trafic réel des concurrents
// ─────────────────────────────────────────────────────────────────────────────

// Une entrée du bulk concurrentiel livré par SEO Engine (POST /gsi/semantic),
// stockée dans rawData.competitors_bulk du score sémantique.
export interface CompetitorBulk {
  domain: string;
  total_traffic: number;
}

// Forme partielle du rawData du score sémantique consommée ici. Compatible avec
// `Record<string, unknown> | null` (type rawData de ProjectScore) : le composant
// cast `rawData as SemanticRawData | null` avant de la passer.
export interface SemanticRawData {
  competitors_bulk?: CompetitorBulk[];
  submitted_competitors?: string[];
}

/**
 * Dérive 3 impressions (pessimistic/realistic/optimistic) depuis competitors_bulk.
 * Logique COMEX : realistic = médiane des trafics, pessimistic = realistic * 0.7,
 * optimistic = realistic * 1.3. Renvoie null si aucune donnée concurrent exploitable
 * (zéro fallback mocké : null → empty state côté composant).
 */
export function deriveImpressionsFromCompetitors(
  rawData: SemanticRawData | null | undefined,
): { pessimistic: number; realistic: number; optimistic: number } | null {
  const bulk = rawData?.competitors_bulk;
  if (!bulk || bulk.length === 0) return null;
  const traffics = bulk
    .map((c) => c.total_traffic)
    .filter((t): t is number => typeof t === 'number' && t >= 0);
  if (traffics.length === 0) return null;
  const sorted = [...traffics].sort((a, b) => a - b);
  const realistic = sorted[Math.floor(sorted.length / 2)];
  return {
    pessimistic: Math.round(realistic * 0.7),
    realistic,
    optimistic: Math.round(realistic * 1.3),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatage
// ─────────────────────────────────────────────────────────────────────────────

// Indice compact d'impressions affiché sous le tag de scénario (« 500 K imp. »).
export function fmtImpressionsHint(imp: number): string {
  if (imp >= 1_000_000)
    return `${(imp / 1_000_000).toFixed(1).replace('.0', '')} M imp.`;
  if (imp >= 1_000) return `${Math.round(imp / 1_000)} K imp.`;
  return `${imp} imp.`;
}

// Nombre entier formaté à la française (séparateur de milliers).
export function fmtNumber(n: number): string {
  return Math.round(n).toLocaleString('fr-FR');
}

// Montant en euros, sans décimales (« 12 500 € »).
export function fmtEur(n: number): string {
  return Math.round(n).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
}
