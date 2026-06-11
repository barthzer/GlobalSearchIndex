"use client";

import { Brand } from "./types";

interface Props {
  brand: Brand;
  size?: number;
  textSize?: string;
  className?: string;
}

export default function BrandAvatar({ brand, size = 24, textSize = "text-[11px]", className = "" }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white ${textSize} ${className}`}
      style={{ background: brand.gradient, width: size, height: size }}
    >
      {brand.logoUrl ? (
        <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
      ) : (
        brand.initial
      )}
    </span>
  );
}
