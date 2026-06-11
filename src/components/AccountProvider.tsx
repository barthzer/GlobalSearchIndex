"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AccountType = "user" | "admin";

export interface Account {
  type: AccountType;
  name: string;
  email: string;
  avatar?: string; // absent → avatar dégradé + initiale (pas de photo demandée au client)
}

const accounts: Account[] = [
  { type: "user", name: "Jean Dupont", email: "jean@uplifygroup.com" },
  { type: "admin", name: "Admin AWI", email: "admin@awi.fr", avatar: "/consultant2.png" },
];

const STORAGE_KEY = "gsi:account:v1";

const AccountContext = createContext<{
  account: Account | null;
  accounts: Account[];
  switchAccount: (type: AccountType) => void;
  login: (type: AccountType) => void;
  /** Connecte un compte construit dynamiquement (ex. créé depuis l'onboarding). */
  loginWith: (account: Account) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  /** true une fois l'état restauré depuis le localStorage (évite les redirections au 1er rendu). */
  hydrated: boolean;
}>({
  account: null,
  accounts,
  switchAccount: () => {},
  login: () => {},
  loginWith: () => {},
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

  // Restauration de la session (le compte créé à l'onboarding persiste).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setAccount(JSON.parse(raw) as Account);
    } catch {
      /* ignore */
    }
    setHydrated(true);
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

  function loginWith(next: Account) {
    applyAccount(next);
  }

  function logout() {
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
