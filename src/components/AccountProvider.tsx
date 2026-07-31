"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  bootstrapAuth,
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
}

const accounts: Account[] = [
  { type: "user", name: "Jean Dupont", email: "jean@uplifygroup.com" },
  { type: "admin", name: "Admin AWI", email: "admin@awi.fr", avatar: "/consultant2.png" },
];

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
  /** Met à jour les champs du compte courant (paramètres du compte). */
  updateAccount: (patch: Partial<Account>) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  /** true une fois l'état restauré depuis le storage (évite les redirections au 1er rendu). */
  hydrated: boolean;
}>({
  account: null,
  accounts,
  switchAccount: () => {},
  login: () => {},
  loginWith: () => {},
  loginWithCredentials: async () => {},
  updateAccount: () => {},
  logout: () => {},
  isAdmin: false,
  isLoggedIn: false,
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

  function loginWith(next: Account) {
    applyAccount(next);
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
        updateAccount,
        logout,
        isAdmin: account?.type === "admin",
        isLoggedIn: account !== null,
        hydrated,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
