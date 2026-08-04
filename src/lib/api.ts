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

// --- Session PROSPECT (funnel public) ---
// Distincte de la session user réelle : JAMAIS de JWT user. L'accès aux données
// passe UNIQUEMENT par ce token prospect, via l'interception d'apiFetch plus bas.
const PROSPECT_KEY = "gsi_prospect";

export interface ProspectSession {
  token: string;
  projectId: string;
}

export function setProspectSession(session: ProspectSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROSPECT_KEY, JSON.stringify(session));
  } catch {
    /* mode privé */
  }
}

export function getProspectSession(): ProspectSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROSPECT_KEY);
    return raw ? (JSON.parse(raw) as ProspectSession) : null;
  } catch {
    return null;
  }
}

export function clearProspectSession(): void {
  // Purge du cache d'analyse AVANT de retirer le token : un nouveau parcours ne
  // doit jamais réafficher les données de l'ancien pendant le laps entre deux
  // sessions (le cache est keyé par token, mais on purge explicitement pour
  // éliminer tout reliquat — zéro cohabitation).
  purgePublicAnalysisCache();
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROSPECT_KEY);
}

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

// ─────────────────────────── Funnel public (prospect) ───────────────────────
// Endpoints SANS auth (request-code, verify-code) + endpoint scopé au token
// prospect (/public/analysis). Aucun id de projet en clair : le token porte le
// scope. La réponse de request-code est TOUJOURS neutre (anti-énumération).

export async function requestPublicCode(email: string, url: string): Promise<void> {
  // Best-effort neutre : un échec réseau ne révèle rien et ne bloque pas l'UI
  // (le prospect saisit son code ou le renvoie). Le serveur ne lance aucune
  // analyse ici — il enregistre la demande et envoie le code.
  try {
    await fetch(`${API_BASE}/public/request-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, url }),
    });
  } catch {
    /* réseau : on reste neutre */
  }
}

export type VerifyPublicCodeResult =
  | { status: "processing" | "ready"; token: string; projectId: string }
  | { status: "cap_reached"; message: string };

// verify-code : succès → session prospect (token + projectId). cap_reached →
// plafond atteint (état dédié côté UI). 401 → code invalide/expiré (throw).
export async function verifyPublicCode(
  email: string,
  code: string,
): Promise<VerifyPublicCodeResult> {
  const res = await fetch(`${API_BASE}/public/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (res.status === 401) {
    throw new Error("Code invalide ou expiré.");
  }
  if (!res.ok) {
    throw new Error("Vérification impossible pour le moment.");
  }
  return (await res.json()) as VerifyPublicCodeResult;
}

// Projet + scores scopés au token prospect (aucun id en paramètre : le projet
// vient du token). Mis en cache pendant le polling pour éviter N appels.
interface PublicAnalysis {
  project: {
    id: string;
    domain: string;
    companyName?: string | null;
    createdAt: string;
  };
  scores: unknown[];
}

let publicAnalysisCache: {
  token: string;
  ts: number;
  promise: Promise<PublicAnalysis>;
} | null = null;
const PUBLIC_ANALYSIS_TTL = 2500; // < période de polling (3s) → 1 appel par cycle

// Vide le cache d'analyse prospect. Appelé au changement de session (clear/set)
// pour qu'aucune réponse d'un token précédent ne soit resservie sous un autre.
export function purgePublicAnalysisCache(): void {
  publicAnalysisCache = null;
}

async function fetchPublicAnalysis(token: string): Promise<PublicAnalysis> {
  const now = Date.now();
  if (
    publicAnalysisCache &&
    publicAnalysisCache.token === token &&
    now - publicAnalysisCache.ts < PUBLIC_ANALYSIS_TTL
  ) {
    return publicAnalysisCache.promise;
  }
  const promise = (async () => {
    const res = await fetch(`${API_BASE}/public/analysis`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      // 401 = token périmé / projet supprimé : on purge la session prospect pour
      // qu'aucun vieux rapport ne reste affiché et que le poll ne boucle pas sur
      // un token mort. Les autres erreurs (5xx transitoires) ne purgent PAS.
      if (res.status === 401) clearProspectSession();
      throw new Error(`public analysis ${res.status}`);
    }
    return (await res.json()) as PublicAnalysis;
  })();
  publicAnalysisCache = { token, ts: now, promise };
  // Un échec ne doit pas empoisonner le cache (sinon le poll boucle sur l'erreur).
  promise.catch(() => {
    if (publicAnalysisCache?.promise === promise) publicAnalysisCache = null;
  });
  return promise;
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Réécrit un POST « commercial » du déblocage sémantique vers son équivalent
// public (token prospect). MÊME body, MÊMES headers JSON. On renvoie la Response
// RÉELLE du backend (y compris 409 « déjà débloqué » / erreurs) pour que le
// formulaire l'affiche. Le token prospect fait foi : jamais d'id en clair.
async function prospectPost(
  publicPath: string,
  session: ProspectSession,
  init: RequestInit,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.token}`);
  if (init.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  return fetch(`${API_BASE}${publicPath}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

// Table des POST du déblocage sémantique : chemin commercial → chemin public.
// Le body est forwardé tel quel (shape identique côté commercial et public).
const PROSPECT_POST_ROUTES: { re: RegExp; to: string }[] = [
  { re: /^\/projects\/[^/]+\/semantic\/generate$/, to: "/public/semantic/generate" },
  { re: /^\/projects\/[^/]+\/semantic\/brand-check$/, to: "/public/semantic/brand-check" },
  { re: /^\/projects\/[^/]+\/competitor-size$/, to: "/public/competitor-size" },
  { re: /^\/projects\/[^/]+\/semantic$/, to: "/public/semantic" },
];

// Route un appel « commercial » (GET /projects…, /projects/:id/scores, recos ;
// POST du déblocage sémantique) vers le canal prospect. Renvoie une Response
// (synthétique pour les GET, réelle du backend pour les POST) au shape attendu
// par les consommateurs existants (GenerationProvider, ConcurrenceTab, modal…).
// Renvoie null si le chemin ne doit PAS être intercepté (comportement normal).
async function prospectInterception(
  path: string,
  session: ProspectSession,
  init: RequestInit,
): Promise<Response | null> {
  const pathname = path.split("?")[0];
  const method = (init.method ?? "GET").toUpperCase();

  // POST du déblocage sémantique → équivalent public (Bearer prospect, body
  // identique, Response réelle renvoyée telle quelle 409/erreurs compris).
  if (method === "POST") {
    const route = PROSPECT_POST_ROUTES.find((r) => r.re.test(pathname));
    if (route) return prospectPost(route.to, session, init);
    return null; // autre POST prospect : comportement inchangé (bloqué plus haut)
  }

  // Liste des projets → un seul projet (celui du token).
  if (pathname === "/projects") {
    const { project } = await fetchPublicAnalysis(session.token);
    return jsonResponse({
      data: [
        {
          id: project.id,
          domain: project.domain,
          companyName: project.companyName ?? null,
          createdAt: project.createdAt,
        },
      ],
      total: 1,
    });
  }

  // Scores d'un projet → scores du token (même shape que l'endpoint commercial).
  if (/^\/projects\/[^/]+\/scores$/.test(pathname)) {
    const { scores } = await fetchPublicAnalysis(session.token);
    return jsonResponse(scores);
  }

  // Recos : NON incluses en Phase 1 → réponse vide adaptée (jamais un 404 qui
  // casserait la vue). Le consommateur affiche un état « pas de recos ».
  if (/^\/projects\/[^/]+\/recommendations$/.test(pathname)) {
    return jsonResponse({ recommendations: [], cta: null });
  }

  return null; // tout autre chemin : comportement normal
}

// --- Fetch authentifié : Bearer + 401 → refresh → rejoue UNE fois ---
export async function apiFetch(
  path: string,
  init: RequestInit = {},
  _retried = false,
): Promise<Response> {
  // Session prospect active : on n'appelle JAMAIS l'API commerciale. Les GET de
  // données sont réécrits vers /public/analysis (token prospect) ; les POST du
  // déblocage sémantique vers /public/* (Response réelle du backend, 409 compris).
  // Tout autre appel prospect renvoie une Response synthétique sûre.
  const prospect = getProspectSession();
  if (prospect) {
    const method = (init.method ?? "GET").toUpperCase();
    if (method === "GET" || method === "POST") {
      try {
        const intercepted = await prospectInterception(path, prospect, init);
        if (intercepted) return intercepted;
      } catch {
        // Échec du canal prospect → 502 synthétique (le consommateur gère
        // l'erreur sans jamais taper l'API commerciale avec un token absent).
        return new Response(JSON.stringify({ message: "prospect fetch failed" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  const headers = new Headers(init.headers);
  const access = authStore.access();
  if (access) headers.set("Authorization", `Bearer ${access}`);
  // FormData (upload logo) : NE PAS forcer application/json — le navigateur pose
  // le multipart/form-data + boundary lui-même.
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  // Données authentifiées (scores, recos, projets) : JAMAIS servies depuis le
  // cache navigateur — une réponse figée re-produit un état obsolète à l'écran
  // (« Ces 8 leviers » après le fix serveur à 9). no-store par défaut, un appelant
  // peut toujours forcer un autre mode via init.cache.
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });

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

// --- OTP (connexion par code email) ---
// requestCode : réponse TOUJOURS neutre côté serveur (anti-énumération) — on ne
// révèle jamais si l'email correspond à un compte. Best-effort : un échec réseau
// ne bloque pas l'UI, l'utilisateur saisit son code ou le renvoie.
export async function requestOtp(email: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/request-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    /* réseau : on reste neutre */
  }
}

// verifyCode : succès → MÊMES tokens que le login password (issueTokens serveur).
// Échec 401 → code invalide/expiré. Lève une erreur pour que l'appelant dise pourquoi.
export async function verifyOtp(email: string, code: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? "Code invalide ou expiré."
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

// Applique un nouveau mot de passe depuis le lien reçu par email. Public (le token
// signé fait foi). Le serveur vérifie signature + expiry 1h + usage unique.
export async function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/reset-password/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? "Lien invalide ou expiré. Demandez-en un nouveau."
        : "Réinitialisation impossible pour le moment.",
    );
  }
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
