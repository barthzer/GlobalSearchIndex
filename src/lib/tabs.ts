/**
 * Configuration des onglets du dashboard, pilotée par rôle.
 * - Admin (AWI) : conserve toutes les vues internes.
 * - Client (user/internaute) : parcours réduit orienté lead (pas d'accueil ni de
 *   projection ; la notoriété est fusionnée dans Analyse ; une vue Recommandations).
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

export function defaultTabForRole(isAdmin: boolean): TabKey {
  return isAdmin ? "home" : "analyse";
}
