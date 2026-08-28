"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";

/**
 * Rendu d'une icône Lottie (Lordicon) via le player light (svg uniquement).
 * Par défaut : boucle continue. Avec `playOnceEvery`, l'animation se joue une
 * seule fois puis reste figée jusqu'au cycle suivant (synchronisé via
 * `startDelay`, ex. rotation d'icônes du bandeau de calcul).
 */
export default function LottieGlyph({
  animationData,
  className = "",
  speed = 1,
  playOnceEvery,
  startDelay = 0,
}: {
  animationData: object;
  className?: string;
  speed?: number;
  playOnceEvery?: number;
  startDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const once = typeof playOnceEvery === "number";
    const anim = lottie.loadAnimation({
      container: ref.current,
      renderer: "svg",
      loop: !once,
      autoplay: !once,
      animationData,
    });
    anim.setSpeed(speed);

    let interval: ReturnType<typeof setInterval> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (once) {
      timeout = setTimeout(() => {
        anim.goToAndPlay(0, true);
        interval = setInterval(() => anim.goToAndPlay(0, true), playOnceEvery);
      }, startDelay);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
      anim.destroy();
    };
  }, [animationData, speed, playOnceEvery, startDelay]);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
