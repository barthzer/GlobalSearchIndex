// Couche d'accès API réelle (remplace le factice). Client-side.
// Contrat auth vérifié en prod : /auth/login → { accessToken(15m), refreshToken(7j), user } ;
// /auth/refresh → { accessToken } SEULEMENT (pas de user, pas de rotation).
// Deux pièges de démo traités ici : refresh single-flight + refresh proactif au boot.

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://gsi.aw-i.com/api"
).replace(/\/$/, "");

const ACCESS_KEY = "gsi_access_token";
const REFRESH_KEY = "gsi_refresh_token";
const USER_KEY = "gsi_user";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "commercial" | "admin";
}

// --- Stockage tokens (SSR-safe) ---
export const authStore = {
  access: () =>
    typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY),
  refresh: () =>
    typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY),
  user: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },
  set: (access: string, refresh: string, user: AuthUser) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  setAccess: (access: string) => localStorage.setItem(ACCESS_KEY, access),
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// --- Refresh single-flight : un seul refresh en vol, les 401 concurrents l'attendent
// (porté de apps/web/src/services/api.ts, éprouvé en prod). ---
let refreshPromise: Promise<string> | null = null;

function doRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = authStore.refresh();
    if (!refreshToken) throw new Error("No refresh token");
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error("refresh failed");
    const data = (await res.json()) as { accessToken: string };
    authStore.setAccess(data.accessToken);
    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

// --- Fetch authentifié : Bearer + 401 → refresh → rejoue UNE fois ---
export async function apiFetch(
  path: string,
  init: RequestInit = {},
  _retried = false,
): Promise<Response> {
  const headers = new Headers(init.headers);
  const access = authStore.access();
  if (access) headers.set("Authorization", `Bearer ${access}`);
  if (init.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && !_retried) {
    try {
      await doRefresh();
      return apiFetch(path, init, true);
    } catch {
      authStore.clear(); // refresh mort (>7j) → purge, le routeur renverra au login
      return res;
    }
  }
  return res;
}

// --- Opérations auth ---
export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? "Identifiants invalides."
        : "Connexion impossible pour le moment.",
    );
  }
  const data = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
  authStore.set(data.accessToken, data.refreshToken, data.user);
  return data.user;
}

// Refresh PROACTIF au boot : si un refreshToken persiste, on échange un access frais
// AVANT le premier appel data (évite le 401 flash sur un onglet rouvert après >15min).
// Le refresh ne renvoyant pas le user, on garde celui du login (stocké).
export async function bootstrapAuth(): Promise<AuthUser | null> {
  const refreshToken = authStore.refresh();
  const user = authStore.user();
  if (!refreshToken || !user) return null;
  try {
    await doRefresh();
    return user;
  } catch {
    authStore.clear();
    return null;
  }
}

export function logout(): void {
  authStore.clear();
}

// basePath injecté par Next (‘’ sur Vercel racine, ‘/barth’ sur notre infra). Pour
// les navigations MANUELLES (window.open) que Next ne préfixe pas automatiquement
// contrairement à <Link>/router.
const BASE_PATH =
  (process.env.__NEXT_ROUTER_BASEPATH as string | undefined) ?? "";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
