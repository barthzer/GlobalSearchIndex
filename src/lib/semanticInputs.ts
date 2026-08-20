"use client";

import { useEffect, useState } from "react";

/**
 * Store partagé (mock localStorage) des concurrents + mots-clés saisis dans la
 * modale SEO sémantique. Les mêmes concurrents alimentent le benchmark concurrents
 * (vue Notoriété) : saisir d'un côté pré-remplit/débloque l'autre.
 *
 * ⚠️ SCOPÉ PAR PROJET (`ownerId`) depuis 2026-08-20 : la clé était GLOBALE, donc les
 * concurrents/mots-clés d'une session fuyaient sur le projet suivant (retour Alexis :
 * « en changeant de session j'ai les mêmes mots-clés que dans l'ancienne »). Chaque
 * projet a désormais sa propre clé → un nouveau projet part vide, jamais l'héritage
 * de l'ancien. `ownerId` = id de projet/génération (currentGeneration.id ou projectId,
 * qui sont le même id).
 * TODO: brancher sur le backend N8N (POST des concurrents/mots-clés).
 */
export interface SemanticInputs {
  competitors: string[];
  keywords: string[];
  /** Timestamp du calcul du score sémantique (null tant que non lancé). */
  computedAt: number | null;
}

const KEY_PREFIX = "gsi:semantic-inputs:v2";
const EVENT = "gsi:semantic-inputs";

const EMPTY: SemanticInputs = { competitors: [], keywords: [], computedAt: null };

/** Clé localStorage scopée au projet. ownerId vide → clé neutre (jamais de fuite). */
function keyFor(ownerId: string): string {
  return `${KEY_PREFIX}:${ownerId || "_none"}`;
}

export function getSemanticInputs(ownerId: string): SemanticInputs {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(keyFor(ownerId));
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<SemanticInputs>) };
  } catch {
    return EMPTY;
  }
}

export function saveSemanticInputs(ownerId: string, patch: Partial<SemanticInputs>) {
  if (typeof window === "undefined") return;
  const next = { ...getSemanticInputs(ownerId), ...patch };
  try {
    window.localStorage.setItem(keyFor(ownerId), JSON.stringify(next));
  } catch {
    /* mode privé */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
}

/** Hook réactif : se met à jour quand un autre composant écrit dans le store du MÊME projet. */
export function useSemanticInputs(ownerId: string): SemanticInputs {
  const [state, setState] = useState<SemanticInputs>(EMPTY);

  useEffect(() => {
    setState(getSemanticInputs(ownerId));
    const onEvent = () => setState(getSemanticInputs(ownerId));
    window.addEventListener(EVENT, onEvent);
    window.addEventListener("storage", onEvent);
    return () => {
      window.removeEventListener(EVENT, onEvent);
      window.removeEventListener("storage", onEvent);
    };
  }, [ownerId]);

  return state;
}
