"use client";

import { createContext, useContext, useState } from "react";

export interface Generation {
  id: string;
  name: string;
  url: string;
  initial: string;
  date: string;
  color: string;
  /**
   * État de calcul du rapport. "processing" = certaines données (process N8N)
   * sont encore en cours. Par défaut "ready". Pilote le bandeau d'attente.
   */
  status?: "processing" | "ready";
}

export const generations: Generation[] = [
  { id: "1", name: "Uplify Group", url: "uplifygroup.com", initial: "U", date: "8 avr. 2026", color: "from-[#5f14fb] to-[#ec4dcb]" },
  { id: "2", name: "Maison Kléber", url: "maisonkleber.fr", initial: "M", date: "7 avr. 2026", color: "from-[#7c3aed] to-[#ec4dcb]" },
  { id: "3", name: "Vino & Co", url: "vinoandco.com", initial: "V", date: "5 avr. 2026", color: "from-[#6366f1] to-[#a78bfa]" },
  { id: "4", name: "NordStar Digital", url: "nordstar.io", initial: "N", date: "2 avr. 2026", color: "from-[#3b82f6] to-[#818cf8]" },
  { id: "5", name: "Atelier Béranger", url: "atelierbéranger.fr", initial: "A", date: "28 mars 2026", color: "from-[#ec4dcb] to-[#f987e0]" },
  { id: "6", name: "CloudSphere", url: "cloudsphere.tech", initial: "C", date: "25 mars 2026", color: "from-[#4f46e5] to-[#7c3aed]" },
  { id: "7", name: "Petit Bateau", url: "petit-bateau.com", initial: "P", date: "22 mars 2026", color: "from-[#6366f1] to-[#ec4dcb]" },
  { id: "8", name: "French Touch Agency", url: "ftagency.com", initial: "F", date: "18 mars 2026", color: "from-[#8b5cf6] to-[#f987e0]" },
  { id: "9", name: "Soleil Intérieur", url: "soleil-interieur.fr", initial: "S", date: "15 mars 2026", color: "from-[#5f14fb] to-[#818cf8]" },
  { id: "10", name: "DataPulse", url: "datapulse.ai", initial: "D", date: "10 mars 2026", color: "from-[#7c3aed] to-[#3b82f6]" },
  { id: "11", name: "Brasserie du Lac", url: "brasseriedulac.com", initial: "B", date: "6 mars 2026", color: "from-[#ec4dcb] to-[#6366f1]" },
  { id: "12", name: "Réseau Pro", url: "reseaupro.fr", initial: "R", date: "1 mars 2026", color: "from-[#3b82f6] to-[#5f14fb]" },
  { id: "13", name: "GreenLeaf", url: "greenleaf.eco", initial: "G", date: "25 fév. 2026", color: "from-[#4f46e5] to-[#ec4dcb]" },
  { id: "14", name: "Luxe & Sens", url: "luxeetsens.com", initial: "L", date: "20 fév. 2026", color: "from-[#f987e0] to-[#8b5cf6]" },
  { id: "15", name: "TechVault", url: "techvault.dev", initial: "T", date: "14 fév. 2026", color: "from-[#6d28d9] to-[#3b82f6]" },
  { id: "16", name: "Horizon Média", url: "horizonmedia.fr", initial: "H", date: "8 fév. 2026", color: "from-[#818cf8] to-[#ec4dcb]" },
  { id: "17", name: "Opus Création", url: "opuscreation.com", initial: "O", date: "2 fév. 2026", color: "from-[#5f14fb] to-[#f987e0]" },
  { id: "18", name: "Yonder Studio", url: "yonderstudio.co", initial: "Y", date: "27 jan. 2026", color: "from-[#7c3aed] to-[#818cf8]" },
];

const GenerationContext = createContext<{
  selected: Generation;
  setSelectedId: (id: string) => void;
  all: Generation[];
  collapsed: boolean;
  toggleCollapsed: () => void;
}>({
  selected: generations[0],
  setSelectedId: () => {},
  all: generations,
  collapsed: false,
  toggleCollapsed: () => {},
});

export function useGeneration() {
  return useContext(GenerationContext);
}

export default function GenerationProvider({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState("1");
  const [collapsed, setCollapsed] = useState(false);
  const selected = generations.find((g) => g.id === selectedId) || generations[0];

  function toggleCollapsed() {
    setCollapsed((prev) => !prev);
  }

  return (
    <GenerationContext.Provider value={{ selected, setSelectedId, all: generations, collapsed, toggleCollapsed }}>
      {children}
    </GenerationContext.Provider>
  );
}
