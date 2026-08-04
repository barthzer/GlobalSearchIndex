"use client";

interface LogoMeta {
  src: string;
  alt: string;
  ratio: number; // width / height
}

const logoMap: Record<string, LogoMeta> = {
  lefigaro: { src: "/MEDIAS/Logo_Le_Figaro.svg", alt: "Le Figaro", ratio: 9608.58 / 1333.02 },
  bfm: { src: "/MEDIAS/bfmm.svg", alt: "BFM Business", ratio: 317 / 40 },
  bfmdark: { src: "/MEDIAS/bfmm-dark.svg", alt: "BFM Business", ratio: 317 / 40 },
  lepoint: { src: "/MEDIAS/lepointnobg.svg", alt: "Le Point", ratio: 184.27 / 38.72 },
  latribune: { src: "/MEDIAS/latribune.svg", alt: "La Tribune", ratio: 3134.9 / 376.03 },
};

interface Props {
  mediaLogo: keyof typeof logoMap;
  className?: string;
  height?: number;
  // Si true (défaut), le logo est transformé en mono-color via mask et utilise currentColor
  // pour s'adapter au thème light/dark. Si false, affichage natif (img).
  themed?: boolean;
  // Si défini, force la couleur du logo (utilise mask + cette couleur). Override `themed` mode.
  color?: string;
}

export default function MediaLogo({
  mediaLogo,
  className = "",
  height = 22,
  themed = true,
  color,
}: Props) {
  const logo = logoMap[mediaLogo];
  if (!logo) return null;

  const width = Math.round(height * logo.ratio);

  // Mode "color forcée" : mask + couleur custom (priorité sur themed)
  if (color) {
    return (
      <span
        role="img"
        aria-label={logo.alt}
        className={`inline-block ${className}`}
        style={{
          width,
          height,
          backgroundColor: color,
          WebkitMask: `url("${logo.src}") no-repeat center / contain`,
          mask: `url("${logo.src}") no-repeat center / contain`,
        }}
      />
    );
  }

  if (themed) {
    return (
      <span
        role="img"
        aria-label={logo.alt}
        className={`media-logo media-logo-${String(mediaLogo)} inline-block ${className}`}
        style={{
          width,
          height,
          WebkitMask: `url("${logo.src}") no-repeat center / contain`,
          mask: `url("${logo.src}") no-repeat center / contain`,
        }}
      />
    );
  }

  return (
    <img
      src={logo.src}
      alt={logo.alt}
      className={`object-contain ${className}`}
      style={{ height, width: "auto", maxWidth: 120 }}
    />
  );
}

// Couleurs natives des médias (utilisées pour le styling des pills, indépendant du thème)
export const mediaNativeColors: Record<string, string> = {
  lefigaro: "#0d6fef",
  bfm: "#0303f4",
  bfmdark: "#0303f4",
  lepoint: "#e41b2f",
  latribune: "#0059b3",
};

export { logoMap };
