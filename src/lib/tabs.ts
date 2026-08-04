/**
 * Configuration des onglets du dashboard, pilotée par rôle.
 * - Admin (AWI) : toutes les vues internes (Accueil, Analyse, Projection,
 *   Concurrence, Notoriété, Recommandations).
 * - Client (user/internaute) : parcours réduit orienté lead (Analyse,
 *   Concurrence, Recommandations) — pas d'accueil, projection ni notoriété.
 */

export type TabKey =
  | "home"
  | "analyse"
  | "projection"
  | "concurrence"
  | "notoriete"
  | "recommandations";

export interface TabDef {
  key: TabKey;
  label: string;
  /** Onglet rendu en icône seule (accueil). */
  iconOnly?: boolean;
}

export const ADMIN_TABS: TabDef[] = [
  { key: "home", label: "Accueil", iconOnly: true },
  { key: "analyse", label: "Analyse" },
  { key: "projection", label: "Projection" },
  { key: "concurrence", label: "Concurrence" },
  { key: "notoriete", label: "Notoriété" },
  { key: "recommandations", label: "Recommandations" },
];

export const CLIENT_TABS: TabDef[] = [
  { key: "analyse", label: "Analyse" },
  { key: "concurrence", label: "Concurrence" },
  { key: "recommandations", label: "Recommandations" },
];

export function tabsForRole(isAdmin: boolean): TabDef[] {
  return isAdmin ? ADMIN_TABS : CLIENT_TABS;
}

export function defaultTabForRole(_isAdmin: boolean): TabKey {
  // Onglet d'ouverture = Analyse pour tous : c'est le pilier câblé (scores + recos).
  // L'onglet Accueil (Maison) reste accessible aux admins mais n'est pas encore
  // câblé (trafic mensuel non tranché) — jamais en premier écran.
  return "analyse";
}
