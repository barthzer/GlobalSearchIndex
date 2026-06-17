"use client";

import { useEffect, useState } from "react";
import { generations } from "@/components/GenerationProvider";
import CoverPage from "./CoverPage";
import AnalysePage from "./AnalysePage";
import RecommendationsPage, { RECO_PER_PAGE } from "./RecommendationsPage";
import ConcurrencePage from "./ConcurrencePage";
import NotorietePage from "./NotorietePage";
import Sommaire from "./Sommaire";
import { recommendations } from "./recommendations";

export default function RapportPage() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [consultant, setConsultant] = useState<string>("");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setClientId(sp.get("clientId") ?? "1");
    setConsultant(sp.get("consultant") ?? "Consultant AWI");
  }, []);

  if (clientId === null) return null;

  const client = generations.find((g) => g.id === clientId) ?? generations[0];

  // Numérotation dynamique : les recommandations s'étalent sur plusieurs pages
  // pour ne jamais couper une carte.
  const recoPages = Math.max(1, Math.ceil(recommendations.length / RECO_PER_PAGE));
  const pAnalyse = 2;
  const pRecoStart = 3;
  const pConcurrence = pRecoStart + recoPages;
  const pNotoriete = pConcurrence + 1;
  const total = pNotoriete; // cover(1) + analyse(1) + recoPages + concurrence(1) + notoriete(1)

  return (
    <>
      <CoverPage client={client} consultant={consultant} />
      <AnalysePage client={client} pageNumber={pAnalyse} totalPages={total} />
      <RecommendationsPage client={client} startPage={pRecoStart} totalPages={total} />
      <ConcurrencePage client={client} pageNumber={pConcurrence} totalPages={total} />
      <NotorietePage client={client} consultant={consultant} pageNumber={pNotoriete} totalPages={total} />

      <Sommaire />

      <button
        onClick={() => window.print()}
        className="no-print fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-accent-purple via-accent-pink via-[47%] to-accent-pink-light px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-accent-pink/20 active:scale-[0.97]"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
        title="Pensez à cocher « Graphiques d'arrière-plan » dans la boîte d'impression"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Télécharger le PDF
      </button>
    </>
  );
}
