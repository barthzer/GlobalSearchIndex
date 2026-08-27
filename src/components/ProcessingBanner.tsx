"use client";

import { useEffect, useState } from "react";
import { useGeneration } from "./GenerationProvider";
import { fetchProjectScores, anyProcessing } from "@/lib/scores";

/**
 * Bandeau sticky d'attente (réf. Rox "no actions remaining" banner) : prévient le
 * client que certaines données du rapport sont encore en cours de calcul.
 * Dismissible, mémorisé en sessionStorage pour ne pas réapparaître à chaque navigation.
 * Ne s'affiche que tant que le projet sélectionné est réellement `processing`
 * (statut dérivé des scores serveur) : dès que tout est prêt, il disparaît.
 */
const DISMISS_KEY = "gsi:processing-banner:dismissed";

export default function ProcessingBanner() {
  const { selected } = useGeneration();
  const [dismissed, setDismissed] = useState(false);
  // Retour COMEX 21/08 (#2) : le bandeau devient autonome sur le poll de SON projet.
  // Valeur initiale dérivée du statut provider (évite le flash), puis on interroge les
  // scores serveur : dès que plus aucun n'est pending/processing, `processing` passe à
  // false → le bandeau se masque tout seul, sans refresh. On ne touche pas au provider
  // partagé (son `status` sert au badge sidebar).
  const [processing, setProcessing] = useState<boolean>(selected?.status !== "ready");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
  }, []);

  const projectId = selected?.id;
  useEffect(() => {
    if (!projectId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function load() {
      try {
        const s = await fetchProjectScores(projectId!);
        if (!active) return;
        const running = anyProcessing(s);
        setProcessing(running);
        // On re-poll tant qu'un score se calcule ; sinon on s'arrête et le bandeau tombe.
        if (running) timer = setTimeout(load, 3000);
      } catch {
        /* réseau : on garde l'état courant, prochain montage réessaiera */
      }
    }
    load();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [projectId]);

  if (dismissed || !processing) return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* mode privé — on ignore */
    }
  }

  return (
    <div
      className="animate-fade-up sticky top-3 z-[6] mb-5 flex items-center gap-3 rounded-xl border border-accent-pink/20 bg-bg-card/90 px-4 py-3 backdrop-blur-xl"
      role="status"
    >
      {/* Spinner */}
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="absolute h-4 w-4 rounded-full border-2 border-accent-pink/20" />
        <span className="absolute h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-accent-pink" />
      </span>

      <p className="flex-1 text-[13px] font-light leading-snug text-text-primary">
        <span className="font-medium">Votre rapport est en cours de finalisation...</span>{" "}
        L&apos;analyse complète peut prendre de quelques minutes à 2 h selon la taille de
        votre site. Les données s&apos;actualisent en temps réel : vous pouvez déjà
        consulter les premiers résultats, inutile de patienter.
      </p>

      <button
        onClick={dismiss}
        aria-label="Masquer le bandeau"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors duration-150 hover:bg-bg-card-hover hover:text-text-primary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
