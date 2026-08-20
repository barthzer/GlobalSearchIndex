"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

// Dashboard SANTÉ des analyses (COMEX 2026-08-20). Lit GET /admin/analyses-health,
// rend la matrice projets × scores avec l'état de chacun + un bouton « Relancer »
// (collecte complète) sur ce qui cloche. Réservé admin (la page /admin gate déjà).

type Health =
  | "ok" | "error" | "stale" | "terminal" | "missing" | "partial"
  | "processing" | "locked" | "absent";

interface ScoreCell {
  scoreType: string;
  status: string | null;
  scoreValue: number | null;
  retryCount: number;
  health: Health;
  reason: string | null;
}
interface ProjectRow {
  projectId: string;
  domain: string;
  companyName: string | null;
  createdAt: string;
  hasProblem: boolean;
  scores: ScoreCell[];
}
interface HealthResponse {
  summary: { total: number; withProblems: number; byHealth: Record<string, number> };
  projects: ProjectRow[];
}

const SCORE_LABELS: Record<string, string> = {
  seo_technical: "SEO Tech",
  geo_citability: "GEO tech",
  geo_citations: "GEO cit.",
  semantic: "Sémantique",
  authority: "Autorité",
  notoriete: "Notoriété",
  page_speed: "PageSpeed",
  visibility: "Visibilité",
};

// Couleur + libellé court par état. terminal/locked = gris (verdict, pas un bug) ;
// error/missing = rouge ; stale/partial = ambre ; ok = vert ; processing = bleu.
const HEALTH_STYLE: Record<Health, { bg: string; text: string; label: string }> = {
  ok: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "OK" },
  error: { bg: "bg-red-500/20", text: "text-red-400", label: "Erreur" },
  missing: { bg: "bg-red-500/15", text: "text-red-300", label: "Vide" },
  stale: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Figé" },
  partial: { bg: "bg-amber-500/12", text: "text-amber-300", label: "Partiel" },
  terminal: { bg: "bg-slate-500/15", text: "text-slate-300", label: "N/M" },
  processing: { bg: "bg-sky-500/15", text: "text-sky-400", label: "…" },
  locked: { bg: "bg-slate-500/10", text: "text-text-muted", label: "🔒" },
  absent: { bg: "bg-white/[0.03]", text: "text-text-muted", label: "—" },
};

const RERUNNABLE: Health[] = ["error", "stale", "missing", "partial", "terminal"];

export default function AnalysesHealth() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyProblems, setOnlyProblems] = useState(true);
  const [rerunning, setRerunning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/admin/analyses-health");
      if (!res.ok) {
        // Message parlant selon la cause RÉELLE : 401/403 = session admin
        // expirée ou périmée (se reconnecter), pas une feature cassée ; autre =
        // vraie erreur serveur avec son code, diagnosticable d'un coup d'œil.
        if (res.status === 401 || res.status === 403) {
          setError(
            "Session admin expirée ou insuffisante — déconnecte-toi puis reconnecte-toi (accès réservé admin).",
          );
        } else {
          setError(`Impossible de charger la santé des analyses (HTTP ${res.status}).`);
        }
        return;
      }
      setData((await res.json()) as HealthResponse);
    } catch {
      // Ici : échec réseau AVANT toute réponse (offline, DNS, CORS), pas un code HTTP.
      setError("Impossible de charger la santé des analyses (réseau indisponible).");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function rerun(projectId: string, type: string) {
    const key = `${projectId}:${type}`;
    setRerunning(key);
    try {
      const res = await apiFetch(`/admin/projects/${projectId}/scores/${type}/rerun`, {
        method: "POST",
        body: "{}",
      });
      if (!res.ok) throw new Error(String(res.status));
      await load();
    } catch {
      setError("Échec de la relance.");
    } finally {
      setRerunning(null);
    }
  }

  if (loading) return <p className="py-8 text-center text-[13px] text-text-muted">Chargement…</p>;
  if (error) return <p className="py-8 text-center text-[13px] text-red-400">{error}</p>;
  if (!data) return null;

  const rows = onlyProblems ? data.projects.filter((p) => p.hasProblem) : data.projects;
  const s = data.summary;

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-text-primary">
          {s.total} projets
        </span>
        <span className="rounded-full bg-red-500/15 px-3 py-1 text-red-400">
          {s.withProblems} avec problème
        </span>
        {(["error", "stale", "missing", "partial", "terminal"] as Health[]).map((h) =>
          s.byHealth[h] ? (
            <span key={h} className={`rounded-full px-3 py-1 ${HEALTH_STYLE[h].bg} ${HEALTH_STYLE[h].text}`}>
              {HEALTH_STYLE[h].label} {s.byHealth[h]}
            </span>
          ) : null,
        )}
        <button
          onClick={() => setOnlyProblems((v) => !v)}
          className="ml-auto rounded-full border border-border-subtle px-3 py-1 text-text-secondary hover:text-text-primary"
        >
          {onlyProblems ? "Voir tous les projets" : "Seulement les problèmes"}
        </button>
        <button
          onClick={() => void load()}
          className="rounded-full border border-border-subtle px-3 py-1 text-text-secondary hover:text-text-primary"
        >
          Rafraîchir
        </button>
      </div>

      {/* Matrice */}
      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border-subtle text-left text-text-muted">
              <th className="p-2 font-medium">Projet</th>
              {Object.keys(SCORE_LABELS).map((t) => (
                <th key={t} className="p-2 text-center font-medium">{SCORE_LABELS[t]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.projectId} className="border-b border-border-subtle/50 align-top">
                <td className="p-2">
                  <div className="font-medium text-text-primary">{p.domain}</div>
                  {p.companyName && <div className="text-text-muted">{p.companyName}</div>}
                </td>
                {p.scores.map((c) => {
                  const st = HEALTH_STYLE[c.health];
                  const key = `${p.projectId}:${c.scoreType}`;
                  const canRerun = RERUNNABLE.includes(c.health) && c.scoreType !== "semantic";
                  return (
                    <td key={c.scoreType} className="p-1.5 text-center">
                      <div
                        className={`inline-flex min-w-[54px] flex-col items-center gap-0.5 rounded-md px-2 py-1 ${st.bg} ${st.text}`}
                        title={c.reason ?? c.health}
                      >
                        <span className="font-medium">
                          {c.scoreValue != null ? c.scoreValue : st.label}
                        </span>
                        {c.retryCount > 3 && <span className="text-[10px] opacity-70">↻{c.retryCount}</span>}
                      </div>
                      {canRerun && (
                        <button
                          onClick={() => void rerun(p.projectId, c.scoreType)}
                          disabled={rerunning === key}
                          className="mt-1 block w-full rounded text-[10px] text-accent-pink hover:underline disabled:opacity-50"
                        >
                          {rerunning === key ? "…" : "Relancer"}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="py-6 text-center text-[13px] text-emerald-400">Aucun problème détecté 🎉</p>
      )}
    </div>
  );
}
