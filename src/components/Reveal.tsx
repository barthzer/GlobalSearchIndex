"use client";

import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  /** Élément rendu (div par défaut). */
  as?: ElementType;
  className?: string;
  /** Décalage avant le début de l'anim (s). */
  delay?: number;
  /** Distance de translation verticale initiale (px). */
  y?: number;
  /** Anime les enfants directs en cascade. */
  stagger?: number;
};

/**
 * Reveal au scroll, réutilisable. Apparition fondu + translation douce.
 * État initial caché géré en CSS ([data-reveal]) pour éviter le flash ;
 * neutralisé si JS absent ou reduced-motion (contenu toujours présent → SEO ok).
 */
export default function Reveal({
  children,
  as,
  className,
  delay = 0,
  y = 24,
  stagger,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const targets = stagger ? (el.children as unknown as Element[]) : el;
      // En mode stagger, on anime les enfants : le conteneur (masqué par le CSS
      // [data-reveal]) doit être rendu visible, sinon tout le bloc reste caché.
      if (stagger) gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: "power3.out",
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          // Libère le compositing une fois l'anim finie (perf).
          onComplete: () => gsap.set(targets, { clearProps: "willChange" }),
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, stagger]);

  return (
    <Tag ref={ref} data-reveal className={className}>
      {children}
    </Tag>
  );
}
