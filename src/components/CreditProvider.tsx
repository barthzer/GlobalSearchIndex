"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAccount } from "./AccountProvider";

/**
 * Système de crédit freemium — MOCK front-end.
 *
 * Un internaute "client" dispose d'1 analyse gratuite par mois. L'état est
 * persisté en localStorage par email de compte (fallback "guest" hors connexion),
 * avec reset mensuel calculé à la lecture.
 *
 * Archi prête à brancher : remplacer `readState`/`writeState` par des appels API
 * (GET/POST crédits) le jour où le backend N8N expose l'usage réel.
 */

const MONTHLY_QUOTA = 1;
const STORAGE_PREFIX = "gsi:credits:v1:";

interface StoredState {
  used: number;
  period: string; // "YYYY-MM" — sert au reset mensuel
}

interface CreditState {
  monthlyQuota: number;
  used: number;
  remaining: number;
  canGenerate: boolean;
  /** Date de réinitialisation, formatée FR (ex. "1 juil. 2026"). */
  resetDate: string;
  /** Consomme un crédit (clampé au quota). */
  consume: () => void;
  /** Hydraté côté client — évite le flash SSR. */
  ready: boolean;
}

const CreditContext = createContext<CreditState>({
  monthlyQuota: MONTHLY_QUOTA,
  used: 0,
  remaining: MONTHLY_QUOTA,
  canGenerate: true,
  resetDate: "",
  consume: () => {},
  ready: false,
});

export function useCredits() {
  return useContext(CreditContext);
}

function currentPeriod(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextResetDate(d = new Date()): string {
  const reset = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return reset.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function readState(key: string): StoredState {
  const period = currentPeriod();
  if (typeof window === "undefined") return { used: 0, period };
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { used: 0, period };
    const parsed = JSON.parse(raw) as StoredState;
    // Reset mensuel : nouvelle période → compteur remis à zéro.
    if (parsed.period !== period) return { used: 0, period };
    return { used: Math.max(0, parsed.used | 0), period };
  } catch {
    return { used: 0, period };
  }
}

function writeState(key: string, state: StoredState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* quota localStorage plein / mode privé — on ignore en mock */
  }
}

export default function CreditProvider({ children }: { children: React.ReactNode }) {
  const { account } = useAccount();
  const storageKey = STORAGE_PREFIX + (account?.email ?? "guest");

  const [used, setUsed] = useState(0);
  const [ready, setReady] = useState(false);

  // Hydratation + re-lecture à chaque changement de compte.
  useEffect(() => {
    const state = readState(storageKey);
    setUsed(state.used);
    setReady(true);
  }, [storageKey]);

  const consume = useCallback(() => {
    setUsed((prev) => {
      const next = Math.min(MONTHLY_QUOTA, prev + 1);
      writeState(storageKey, { used: next, period: currentPeriod() });
      // TODO(backend N8N): POST /credits/consume { email } pour décrémenter le quota réel.
      return next;
    });
  }, [storageKey]);

  const remaining = Math.max(0, MONTHLY_QUOTA - used);

  return (
    <CreditContext.Provider
      value={{
        monthlyQuota: MONTHLY_QUOTA,
        used,
        remaining,
        canGenerate: remaining > 0,
        resetDate: nextResetDate(),
        consume,
        ready,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
}
