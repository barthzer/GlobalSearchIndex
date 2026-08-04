"use client";

import { useEffect, useState } from "react";

/**
 * Store partagé (mock localStorage) des concurrents + mots-clés saisis dans la
 * modale SEO sémantique. Les mêmes concurrents alimentent le benchmark concurrents
 * (vue Notoriété) : saisir d'un côté pré-remplit/débloque l'autre.
 * TODO: brancher sur le backend N8N (POST des concurrents/mots-clés).
 */
export interface SemanticInputs {
  competitors: string[];
  keywords: string[];
  /** Timestamp du calcul du score sémantique (null tant que non lancé). */
  computedAt: number | null;
}

const KEY = "gsi:semantic-inputs:v1";
const EVENT = "gsi:semantic-inputs";

const EMPTY: SemanticInputs = { competitors: [], keywords: [], computedAt: null };

export function getSemanticInputs(): SemanticInputs {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<SemanticInputs>) };
  } catch {
    return EMPTY;
  }
}

export function saveSemanticInputs(patch: Partial<SemanticInputs>) {
  if (typeof window === "undefined") return;
  const next = { ...getSemanticInputs(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* mode privé */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
}

/** Hook réactif : se met à jour quand un autre composant écrit dans le store. */
export function useSemanticInputs(): SemanticInputs {
  const [state, setState] = useState<SemanticInputs>(EMPTY);

  useEffect(() => {
    setState(getSemanticInputs());
    const onEvent = () => setState(getSemanticInputs());
    window.addEventListener(EVENT, onEvent);
    window.addEventListener("storage", onEvent);
    return () => {
      window.removeEventListener(EVENT, onEvent);
      window.removeEventListener("storage", onEvent);
    };
  }, []);

  return state;
}
