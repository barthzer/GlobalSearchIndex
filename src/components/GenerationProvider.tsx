"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAccount } from "./AccountProvider";

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
  /** Terme de recherche (filtré SERVEUR via ?search=). */
  search: string;
  setSearch: (v: string) => void;
  /** Re-fetch la liste (ex. après création d'un projet). */
  refresh: () => Promise<void>;
}>({
  selected: PLACEHOLDER,
  setSelectedId: () => {},
  all: [],
  collapsed: false,
  toggleCollapsed: () => {},
  loading: true,
  search: "",
  setSearch: () => {},
  refresh: async () => {},
});

export function useGeneration() {
  return useContext(GenerationContext);
}

export default function GenerationProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, hydrated } = useAccount();
  const [all, setAll] = useState<Generation[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  // Recherche SERVEUR (reprise d'apps/web) : saisie débouncée → refetch filtré.
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Projet sélectionné caché pour qu'il reste affiché pendant une recherche (les
  // résultats remplacent `all`, la vue principale ne doit pas sauter).
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);

  // M1 : liste réelle (GET /projects, lecture seule). Le corps du rapport reste
  // factice jusqu'à M3. Extrait en loadProjects pour l'exposer en refresh()
  // (rafraîchissement après création de projet — M2).
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      // L'API filtre via ?search= (ILIKE domain/companyName) : la recherche trouve
      // N'IMPORTE quel projet, pas seulement les chargés (fin du mur des 30).
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        sort: "createdAt",
        order: "DESC",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await apiFetch(`/projects?${params.toString()}`);
      if (!res.ok) throw new Error(`projects ${res.status}`);
      const body = (await res.json()) as { data: ApiProject[]; total: number };
      const gens = body.data.map(toGeneration);
      setAll(gens);
      if (gens.length) {
        // Liste COMPLÈTE (hors recherche) : si le projet sélectionné n'est plus dans
        // la liste — typiquement un CHANGEMENT DE PROSPECT/SESSION — on repointe sur
        // le premier. Sans ça, le header gardait le NOM du parcours précédent (via le
        // cache selectedGen) alors que les données étaient déjà les bonnes (retour
        // Alexis 2026-08-13 : « daccueil » affiché sur l'analyse ecomundo). En
        // RECHERCHE, on garde le gen courant caché (il peut être hors résultats).
        setSelectedId((prev) =>
          debouncedSearch
            ? prev || gens[0].id
            : gens.some((g) => g.id === prev)
              ? prev
              : gens[0].id,
        );
      }

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
            setAll((cur) =>
              cur.map((g) =>
                g.id === gen.id
                  ? { ...g, status: processing ? "processing" : "ready" }
                  : g,
              ),
            );
          } catch {
            /* statut best-effort */
          }
        }),
      );
    } catch {
      setAll([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  // Debounce 300ms de la saisie (comme apps/web) → déclenche le refetch serveur.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Le fetch attend l'AUTHENTIFICATION : le provider est monté au layout racine,
  // donc sans ce garde il partait au chargement (avant login) → 401 → liste vide.
  useEffect(() => {
    if (!hydrated) return; // on attend la restauration de session
    if (!isLoggedIn) {
      setAll([]);
      setLoading(false);
      return;
    }
    loadProjects();
  }, [hydrated, isLoggedIn, loadProjects]);

  // Deep-link admin « Voir l'analyse » (vue Prospects) : ?project=<id> sélectionne
  // ce projet une fois la liste chargée. One-shot (n'écrase pas une nav manuelle
  // ultérieure). Sans param → marqué appliqué immédiatement, comportement inchangé.
  const deepLinkApplied = useRef(false);
  useEffect(() => {
    if (deepLinkApplied.current || typeof window === "undefined") return;
    const wanted = new URLSearchParams(window.location.search).get("project");
    if (!wanted) {
      deepLinkApplied.current = true;
      return;
    }
    if (all.some((g) => g.id === wanted)) {
      setSelectedId(wanted);
      deepLinkApplied.current = true;
    }
  }, [all]);

  // Cache le gen sélectionné dès qu'il est dans `all` (chargement initial + nav).
  useEffect(() => {
    const g = all.find((x) => x.id === selectedId);
    if (g) setSelectedGen(g);
  }, [all, selectedId]);
  // Pendant une recherche, si le projet courant n'est pas dans les résultats, on
  // garde le gen caché plutôt que de sauter sur le premier résultat.
  const selected =
    all.find((g) => g.id === selectedId) ?? selectedGen ?? all[0] ?? PLACEHOLDER;

  function toggleCollapsed() {
    setCollapsed((prev) => !prev);
  }

  return (
    <GenerationContext.Provider
      value={{ selected, setSelectedId, all, collapsed, toggleCollapsed, loading, search, setSearch, refresh: loadProjects }}
    >
      {children}
    </GenerationContext.Provider>
  );
}
