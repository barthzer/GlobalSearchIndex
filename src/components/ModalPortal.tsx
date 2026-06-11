"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
  /** z-index pour le portail. Default: 100 — passe au-dessus du Header (z-10) */
  zIndex?: number;
}

/**
 * Wrapper standardisé pour toutes les modales :
 * - Rend le contenu via createPortal au niveau de document.body (centrage viewport garanti, hors stacking context)
 * - Bloque le scroll du body pendant que la modale est ouverte (restauration au unmount)
 * - Évite les warnings d'hydration côté serveur
 *
 * Utilisation : envelopper le JSX de la modale (qui doit déjà gérer son propre overlay
 * et son centrage avec `fixed inset-0 flex items-center justify-center`).
 */
export default function ModalPortal({ children, zIndex = 100 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: "relative", zIndex }}>{children}</div>,
    document.body
  );
}
