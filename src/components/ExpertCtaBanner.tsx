"use client";

import Button from "./Button";

/**
 * Bannière CTA expert pleine largeur (contenu à gauche, image experts à droite).
 * Réutilisée en bas des vues client (analyse, concurrence…).
 */
export default function ExpertCtaBanner({
  onExpertClick,
  className = "",
  title = "Un expert AWI décrypte vos résultats",
  body = "Transformez votre diagnostic en plan d'action priorisé pour gagner rapidement en visibilité.",
  cta = "Obtenez mon plan d'action",
}: {
  onExpertClick: () => void;
  className?: string;
  title?: string;
  body?: string;
  cta?: string;
}) {
  return (
    <div
      className={`animate-fade-up relative flex flex-col overflow-hidden rounded-2xl lg:flex-row lg:items-stretch ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(20,4,18,0.10) 0%, rgba(20,4,18,0.45) 100%), url('/expert-card-bg-wide.jpg') center/cover no-repeat, radial-gradient(120% 80% at 50% 0%, rgba(236,77,203,0.3) 0%, transparent 55%), linear-gradient(160deg, #2b0826 0%, #46103c 100%)",
      }}
    >
      {/* Contenu — à gauche, 48px de padding vertical & horizontal */}
      <div className="relative z-10 flex flex-1 flex-col justify-center gap-3 px-8 py-8 lg:py-12 lg:pl-12 lg:pr-6">
        <div className="flex items-center gap-2">
          <div className="flex shrink-0 -space-x-2">
            {["/consultant1.png", "/consultant2.png", "/consultant3.png"].map((src) => (
              <img key={src} src={src} alt="Consultant" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
            ))}
          </div>
          <span className="min-w-0 text-[12px] font-medium leading-snug text-white/85">
            +500 clients PME, ETI et marques B2B accompagnés
          </span>
        </div>

        <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.4px] text-white">{title}</h3>
        <p className="text-[15px] font-light leading-relaxed text-white/75 md:max-w-[440px]">{body}</p>

        <div>
          <Button variant="primary" onClick={onExpertClick}>
            {cta}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Button>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-white/85">
          <img src="/google.svg" alt="Google" className="h-3.5 w-3.5" />
          <span>Noté 5.0 sur 50+ avis</span>
          <span className="flex -space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="#FBBF24">
                <path d="M11.48 3.5a.562.562 0 0 1 1.04 0l2.125 5.11a.563.563 0 0 0 .475.346l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.884a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.563.563 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            ))}
          </span>
        </div>
      </div>

      {/* Image experts — à droite, padding 48 à droite, collée en bas */}
      <div className="hidden shrink-0 self-stretch lg:flex lg:w-[440px] lg:items-end lg:justify-end lg:pr-12">
        <img
          src="/expertswidedivcta.png"
          alt=""
          className="pointer-events-none max-h-full w-auto max-w-full object-contain object-bottom"
        />
      </div>
    </div>
  );
}
