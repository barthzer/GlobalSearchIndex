"use client";

import Link from "next/link";

type Variant = "primary" | "secondary" | "tertiary";

interface ButtonProps {
  variant?: Variant;
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit";
  className?: string;
  fullWidth?: boolean;
  onClick?: () => void;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 active:scale-[0.97] whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-accent-purple via-accent-pink via-[47%] to-accent-pink-light text-white px-6 py-3 text-sm hover:shadow-lg hover:shadow-accent-pink/20",
  secondary:
    "bg-text-primary text-bg-primary px-6 py-3 text-sm hover:opacity-90",
  tertiary:
    "bg-bg-card border border-border-subtle text-text-primary px-6 py-3 text-sm hover:bg-bg-card-hover",
};

export default function Button({
  variant = "primary",
  children,
  href,
  type = "button",
  className = "",
  fullWidth = false,
  onClick,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`;
  const style = { transitionTimingFunction: "var(--ease-out)" };

  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} style={style} onClick={onClick}>
      {children}
    </button>
  );
}
