// Rapport prospect (surface client, /report/:token). PUBLIC : aucun JWT. Barth ne
// fait que RENDRE le payload serveur — les décisions d'affichage sont déjà
// résolues par buildScoreDisplay(score, 'prospect') côté serveur (même source que
// le PDF → écran = PDF = prospect par construction). Zéro recalcul, zéro logique
// métier, aucun nom de fournisseur (lint check:vendor-leak couvre cette surface).
import type { ScoreDisplay } from "@/lib/scores";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://gsi.aw-i.com/api"
).replace(/\/$/, "");

export interface ReportScore {
  scoreType:
    | "seo_technical"
    | "geo_citability"
    | "geo_citations"
    | "authority"
    | "semantic";
  scoreValue: number | null;
  rawData: Record<string, unknown> | null;
  display: ScoreDisplay;
}

export interface ReportReco {
  axe?: string;
  pilier?: string;
  probleme?: string;
  diagnostic?: string;
  objectif?: string;
  action?: string;
  impact?: "Fort" | "Moyen" | "Faible" | string;
}

export interface ReportPayload {
  project: {
    domain: string;
    companyName: string | null;
    logoUrl: string | null;
    description: string | null;
  };
  scores: ReportScore[];
  recommendations:
    | { recommendations?: ReportReco[]; cta?: string; [k: string]: unknown }
    | null;
}

export interface VisibilityPoint {
  month: string; // "YYYY-MM"
  visibility: number; // indice de visibilité (champ renvoyé par l'API)
}
export interface PositionsPoint {
  month: string;
  top3?: number;
  top10?: number;
  top50?: number;
  [k: string]: unknown;
}
export interface ReportVisibility {
  visibility_history: VisibilityPoint[];
  positions_history: PositionsPoint[];
}

export async function fetchReport(token: string): Promise<ReportPayload> {
  const res = await fetch(`${API_BASE}/report/${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as ReportPayload;
}

// Visibilité : best-effort. Absente / en erreur → la section affiche un état
// explicite (jamais un chiffre inventé), le reste du rapport reste lisible.
export async function fetchReportVisibility(
  token: string,
): Promise<ReportVisibility | null> {
  try {
    const res = await fetch(
      `${API_BASE}/report/${encodeURIComponent(token)}/visibility`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as ReportVisibility;
  } catch {
    return null;
  }
}

// Lit le token depuis l'URL (/report/:token, éventuellement avec basePath et
// slash final). L'export statique sert une page unique ; le token vit dans le path.
export function tokenFromPathname(pathname: string): string | null {
  const m = pathname.match(/\/report\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : null;
}
