"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export interface Generation {
  id: string;
  name: string;
  url: string;
  initial: string;
  date: string;
  color: string;
  /**
   * État de calcul du rapport. "processing" = au moins un score encore en
   * pending/processing. Par défaut "ready". Pilote le bandeau d'attente.
   */
  status?: "processing" | "ready";
}

// FACTICE — consommé UNIQUEMENT par la page rapport imprimable (dashboard/rapport)
// dont le CORPS (scores/recos/concurrence/notoriété) reste factice jusqu'à M3.
// La LISTE du dashboard (sidebar) vient désormais de l'API (état `all` ci-dessous).
// À retirer quand M3 câblera le rapport sur les vraies données.
export const generations: Generation[] = [
  { id: "1", name: "Uplify Group", url: "uplifygroup.com", initial: "U", date: "8 avr. 2026", color: "from-[#5f14fb] to-[#ec4dcb]" },
  { id: "2", name: "Maison Kléber", url: "maisonkleber.fr", initial: "M", date: "7 avr. 2026", color: "from-[#7c3aed] to-[#ec4dcb]" },
  { id: "3", name: "Vino & Co", url: "vinoandco.com", initial: "V", date: "5 avr. 2026", color: "from-[#6366f1] to-[#a78bfa]" },
];

// Palette de dégradés cyclée par index (identique à la maquette).
const COLORS = [
  "from-[#5f14fb] to-[#ec4dcb]",
  "from-[#7c3aed] to-[#ec4dcb]",
  "from-[#6366f1] to-[#a78bfa]",
  "from-[#3b82f6] to-[#818cf8]",
  "from-[#ec4dcb] to-[#f987e0]",
  "from-[#4f46e5] to-[#7c3aed]",
];

// Placeholder non-null tant que la vraie liste n'est pas chargée (les consommateurs
// supposent selected != null ; le dashboard gate en amont sur `loading`).
const PLACEHOLDER: Generation = {
  id: "",
  name: "",
  url: "",
  initial: "?",
  date: "",
  color: COLORS[0],
};

// Seuil au-delà duquel le N+1 (1 fetch scores par projet pour le statut) devient
// visible. Kevin 2026-07-27 : on garde le fetch client mais on borne + on trace,
// en attendant l'endpoint agrégé scoreSummary côté API.
const NPLUS1_THRESHOLD = 20;

interface ApiProject {
  id: string;
  domain: string;
  companyName?: string | null;
  createdAt: string;
}
interface ApiScore {
  scoreType: string;
  status: "pending" | "processing" | "completed" | "error";
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function toGeneration(p: ApiProject, i: number): Generation {
  const name = p.companyName?.trim() || p.domain;
  return {
    id: p.id,
    name,
    url: p.domain,
    initial: (name[0] || "?").toUpperCase(),
    date: p.createdAt ? dateFmt.format(new Date(p.createdAt)) : "",
    color: COLORS[i % COLORS.length],
  };
}

const GenerationContext = createContext<{
  selected: Generation;
  setSelectedId: (id: string) => void;
  all: Generation[];
  collapsed: boolean;
  toggleCollapsed: () => void;
  loading: boolean;
}>({
  selected: PLACEHOLDER,
  setSelectedId: () => {},
  all: [],
  collapsed: false,
  toggleCollapsed: () => {},
  loading: true,
});

export function useGeneration() {
  return useContext(GenerationContext);
}

export default function GenerationProvider({ children }: { children: React.ReactNode }) {
  const [all, setAll] = useState<Generation[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // M1 : liste réelle (GET /projects, lecture seule). Le corps du rapport reste
  // factice jusqu'à M3.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(
          "/projects?page=1&limit=30&sort=createdAt&order=DESC",
        );
        if (!res.ok) throw new Error(`projects ${res.status}`);
        const body = (await res.json()) as { data: ApiProject[]; total: number };
        if (cancelled) return;
        const gens = body.data.map(toGeneration);
        setAll(gens);
        if (gens.length) setSelectedId((prev) => prev || gens[0].id);

        // Statut par projet (N+1) — borné au seuil, au-delà on trace et on n'affiche
        // pas de statut (badge neutre) plutôt que d'exploser le nombre de requêtes.
        if (body.total > NPLUS1_THRESHOLD) {
          console.warn(
            `[GSI] ${body.total} projets : N+1 statut borné à ${NPLUS1_THRESHOLD}. ` +
              `Basculer sur scoreSummary côté API quand ce seuil est régulièrement dépassé.`,
          );
        }
        const withStatus = gens.slice(0, NPLUS1_THRESHOLD);
        await Promise.all(
          withStatus.map(async (gen) => {
            try {
              const r = await apiFetch(`/projects/${gen.id}/scores`);
              if (!r.ok) return;
              const scores = (await r.json()) as ApiScore[];
              const processing = scores.some(
                (s) => s.status === "pending" || s.status === "processing",
              );
              if (!cancelled) {
                setAll((cur) =>
                  cur.map((g) =>
                    g.id === gen.id
                      ? { ...g, status: processing ? "processing" : "ready" }
                      : g,
                  ),
                );
              }
            } catch {
              /* statut best-effort */
            }
          }),
        );
      } catch {
        if (!cancelled) setAll([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = all.find((g) => g.id === selectedId) || all[0] || PLACEHOLDER;

  function toggleCollapsed() {
    setCollapsed((prev) => !prev);
  }

  return (
    <GenerationContext.Provider
      value={{ selected, setSelectedId, all, collapsed, toggleCollapsed, loading }}
    >
      {children}
    </GenerationContext.Provider>
  );
}
