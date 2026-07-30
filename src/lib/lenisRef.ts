import type Lenis from "lenis";

/**
 * Référence partagée vers l'instance Lenis active (montée par SmoothScroll).
 * Permet de piloter le smooth scroll depuis n'importe quel composant
 * (ex. un CTA qui ramène l'utilisateur vers le hero) sans passer par un contexte.
 * `null` si le smooth scroll n'est pas actif (SSR ou prefers-reduced-motion).
 */
export const lenisRef: { current: Lenis | null } = { current: null };
