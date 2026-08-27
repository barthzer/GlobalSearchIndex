"use client";

/**
 * Pile de mini-cartes « recommandations » animée : boucle où la carte du fond passe au
 * premier plan (keyframes reco-cycle), légère rotation. Teaser des recos gatées derrière
 * le contact expert. Porté AU PIXEL de la maquette Barth (GSI-Front, RecoCardStack).
 */
export default function RecoCardStack({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-[84px] w-[120px] ${className}`}>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="animate-reco-cycle absolute left-1/2 top-0 flex h-[60px] w-[110px] items-center gap-2.5 rounded-xl border border-border-subtle bg-modal-bg px-3.5 shadow-[0_18px_36px_-12px_rgba(14,4,27,0.3)]"
          style={i === 1 ? { animationDelay: "-3.5s" } : undefined}
        >
          {/* Carré numéro + deux lignes de texte, comme les vraies cartes (silhouette). */}
          <span className="h-5 w-5 shrink-0 rounded-md bg-gradient-to-br from-[#6817F8]/60 to-[#EE56CE]/60" />
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="h-1.5 w-full rounded-full" style={{ backgroundColor: "var(--arc-bg)" }} />
            <span className="h-1.5 w-2/3 rounded-full" style={{ backgroundColor: "var(--arc-bg)" }} />
          </span>
        </div>
      ))}
    </div>
  );
}
