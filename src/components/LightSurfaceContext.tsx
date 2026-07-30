"use client";

import { createContext, useContext } from "react";

/**
 * Indique qu'on est dans une surface « light-only » (ex. la landing / page d'accueil).
 * Fourni par la landing et lu par les portails de modales : comme le contexte React
 * suit l'arbre de composants (pas le DOM), les modales rendues via createPortal sur
 * document.body héritent quand même de cette valeur et peuvent se forcer en light.
 */
export const LightSurfaceContext = createContext(false);

export function useLightSurface() {
  return useContext(LightSurfaceContext);
}
