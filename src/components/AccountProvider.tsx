"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  bootstrapAuth,
  verifyOtp as apiVerifyOtp,
  clearProspectSession,
  type AuthUser,
} from "@/lib/api";

type AccountType = "user" | "admin";

export interface Account {
  type: AccountType;
  name: string; // nom complet affiché (dérivé de firstName + lastName) — sert aux initiales avatar
  email: string;
  avatar?: string; // absent → avatar dégradé + initiale (pas de photo demandée au client)
  id?: string;
  role?: AuthUser["role"];
  // Champs lead (capturés à l'onboarding, éditables dans les paramètres du compte, sauf email).
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  // Prospect (funnel public) : compte d'affichage NON-admin, sans JWT user.
  // L'accès aux données passe uniquement par le token prospect (cf. lib/api).
  isProspect?: boolean;
}

// Aucune identité factice : la session courante vient soit d'un JWT réel
// (toAccount), soit d'un token prospect. Pas de « changement de compte » en prod
// (une maquette Barth exposait Jean Dupont + Admin AWI ici — supprimé).
const accounts: Account[] = [];

const STORAGE_KEY = "gsi:account:v1";

/** Un utilisateur réel (API) → compte d'affichage. Le rôle pilote isAdmin. */
function toAccount(user: AuthUser): Account {
  return {
    type: user.role === "admin" ? "admin" : "user",
    name: user.name,
    email: user.email,
    id: user.id,
    role: user.role,
  };
}

const AccountContext = createContext<{
  account: Account | null;
  accounts: Account[];
  switchAccount: (type: AccountType) => void;
  login: (type: AccountType) => void;
  /** Connecte un compte construit dynamiquement (ex. créé depuis l'onboarding). */
  loginWith: (account: Account) => void;
  /** Connexion RÉELLE email + mot de passe (POST /auth/login). Lève une erreur si échec. */
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  /** Connexion RÉELLE par code OTP (POST /auth/verify-code). Lève une erreur si échec. */
  loginWithOtp: (email: string, code: string) => Promise<void>;
  /** Pose un compte PROSPECT (funnel public) : non-admin, sans JWT user. */
  loginAsProspect: (account: Account) => void;
  /** Met à jour les champs du compte courant (paramètres du compte). */
  updateAccount: (patch: Partial<Account>) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  /** true si la session courante est un prospect (funnel public). */
  isProspect: boolean;
  /** true une fois l'état restauré depuis le storage (évite les redirections au 1er rendu). */
  hydrated: boolean;
}>({
  account: null,
  accounts,
  switchAccount: () => {},
  login: () => {},
  loginWith: () => {},
  loginWithCredentials: async () => {},
  loginWithOtp: async () => {},
  loginAsProspect: () => {},
  updateAccount: () => {},
  logout: () => {},
  isAdmin: false,
  isLoggedIn: false,
  isProspect: false,
  hydrated: false,
});

export function useAccount() {
  return useContext(AccountContext);
}

function persist(account: Account | null) {
  if (typeof window === "undefined") return;
  try {
    if (account) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* mode privé */
  }
}

export default function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Boot : refresh PROACTIF si une session réelle persiste (tokens), sinon fallback
  // sur l'état factice legacy (flux onboarding/OTP pas encore câblés).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await bootstrapAuth();
        if (cancelled) return;
        if (user) {
          setAccount(toAccount(user));
        } else {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) setAccount(JSON.parse(raw) as Account);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function applyAccount(next: Account | null) {
    setAccount(next);
    persist(next);
  }

  function switchAccount(type: AccountType) {
    const found = accounts.find((a) => a.type === type);
    if (found) applyAccount(found);
  }

  function login(type: AccountType) {
    switchAccount(type);
  }

  // Connexion réelle : POST /auth/login (via lib/api). Stocke les tokens, pose le compte.
  async function loginWithCredentials(email: string, password: string) {
    const user = await apiLogin(email, password);
    setAccount(toAccount(user));
    // Pas de persist(STORAGE_KEY) : la session réelle vit dans les tokens (gsi_user).
  }

  // Connexion réelle par code : POST /auth/verify-code (via lib/api). Mêmes tokens
  // que le password, même compte — jamais de création à la volée.
  async function loginWithOtp(email: string, code: string) {
    const user = await apiVerifyOtp(email, code);
    setAccount(toAccount(user));
    // Pas de persist(STORAGE_KEY) : la session réelle vit dans les tokens (gsi_user).
  }

  function loginWith(next: Account) {
    applyAccount(next);
  }

  // Prospect (funnel public) : compte d'affichage persisté (pas de JWT). Force
  // le type "user" (jamais admin) et le drapeau isProspect. Les données ne sont
  // JAMAIS servies par ce compte — elles passent par le token prospect (lib/api).
  //
  // PURGE du token staff résiduel (retour Alexis 2026-08-20) : entrer dans le funnel
  // prospect est une intention EXPLICITE d'être prospect. Sans cette purge, un token
  // interne subsistant fait primer la session staff (garde lib/api) → le prospect est
  // ignoré, puis à l'expiration du token (15 min) le dashboard renvoie vers la PORTE
  // ADMIN (/login → /connexion-admin). apiLogout ne touche QUE les tokens staff
  // (gsi_access/refresh/user) ; la session prospect posée juste avant est préservée.
  function loginAsProspect(next: Account) {
    apiLogout();
    applyAccount({ ...next, type: "user", isProspect: true });
  }

  function updateAccount(patch: Partial<Account>) {
    setAccount((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }

  function logout() {
    apiLogout(); // purge les tokens réels
    clearProspectSession(); // purge la session prospect (funnel public)
    applyAccount(null);
  }

  return (
    <AccountContext.Provider
      value={{
        account,
        accounts,
        switchAccount,
        login,
        loginWith,
        loginWithCredentials,
        loginWithOtp,
        loginAsProspect,
        updateAccount,
        logout,
        isAdmin: account?.type === "admin",
        isLoggedIn: account !== null,
        isProspect: account?.isProspect === true,
        hydrated,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
