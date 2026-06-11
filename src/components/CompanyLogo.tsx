"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface CompanyLogoProps {
  name: string;
  initial: string;
}

export default function CompanyLogo({ name, initial }: CompanyLogoProps) {
  const [logo, setLogo] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hovered) updatePosition();
  }, [hovered, updatePosition]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const showTooltip = hovered && !logo;

  return (
    <div
      ref={triggerRef}
      className="group relative inline-flex items-center gap-2.5 rounded-full border border-border-badge bg-bg-card pl-[7px] pr-4 py-[7px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo / Initial */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent-purple to-accent-pink text-xs font-bold text-white transition-all duration-200"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        {logo ? (
          <img src={logo} alt={name} className="h-full w-full object-cover" />
        ) : (
          initial
        )}

        {/* Pencil overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200"
          style={{
            opacity: hovered ? 1 : 0,
            transitionTimingFunction: "var(--ease-out)",
          }}
        >
          <svg className="h-3.5 w-3.5" style={{ color: "#ffffff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </div>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <span className="text-[14px] font-normal text-text-secondary">{name}</span>

      {/* Tooltip via portal — rendered at body level, above all stacking contexts */}
      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[#0e041b] shadow-lg transition-all duration-200"
            style={{
              zIndex: 9999,
              left: tooltipPos.x,
              top: tooltipPos.y,
              opacity: showTooltip ? 1 : 0,
              transform: `translate(-50%, ${showTooltip ? "-100%" : "calc(-100% + 4px)"})`,
              transitionTimingFunction: "var(--ease-out)",
            }}
          >
            Ajouter votre logo
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" />
          </div>,
          document.body
        )}
    </div>
  );
}
