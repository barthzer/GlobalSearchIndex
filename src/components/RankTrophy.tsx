"use client";

/**
 * Trophée de positionnement benchmark : or (1er), argent (2e), bronze (3e).
 * Icône trophée blanche nette sur pastille pleine couleur médaille.
 * Hors podium (4e+) : pastille neutre avec une icône drapeau (marqueur de position).
 */
const MEDALS: Record<number, { from: string; to: string; label: string }> = {
  1: { from: "#FCD34D", to: "#F59E0B", label: "Or" },
  2: { from: "#E5E7EB", to: "#9CA3AF", label: "Argent" },
  3: { from: "#E0A06A", to: "#B45309", label: "Bronze" },
};

export default function RankTrophy({ rank, size = 22 }: { rank: number; size?: number }) {
  const medal = MEDALS[rank];

  // Hors podium : marqueur de position neutre (pastille slate + drapeau).
  if (!medal) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(140deg, #CBD5E1, #475569)",
          boxShadow: "0 1px 4px -1px rgba(71,85,105,0.5)",
        }}
        title={`${rank}ᵉ`}
        aria-label={`Rang ${rank}`}
      >
        <svg
          width={size * 0.58}
          height={size * 0.58}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 21V4m0 0h11l-2 3.5L16 11H5" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(140deg, ${medal.from}, ${medal.to})`,
        boxShadow: `0 1px 4px -1px ${medal.to}80`,
      }}
      title={`${medal.label} · ${rank}ᵉ`}
      aria-label={`Rang ${rank} (${medal.label})`}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="translate(0, 2.5)">
          <path d="M8 18h8M12 13v5M7 4h10v4a5 5 0 0 1-10 0V4Z" />
          <path d="M7 5H4.5a2 2 0 0 0 2 3M17 5h2.5a2 2 0 0 1-2 3" />
        </g>
      </svg>
    </span>
  );
}
