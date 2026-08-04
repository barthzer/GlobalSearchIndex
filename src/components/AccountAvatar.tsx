"use client";

/**
 * Avatar de compte : photo si fournie, sinon cercle dégradé (#FF92C5 → #F986E0)
 * avec l'initiale du nom (on ne demande pas de photo de profil au client).
 */
export default function AccountAvatar({
  name,
  avatar,
  size = 32,
  className = "",
}: {
  name: string;
  avatar?: string;
  size?: number;
  className?: string;
}) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background: "linear-gradient(135deg, #FF92C5 0%, #F986E0 100%)",
      }}
      aria-hidden
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}
