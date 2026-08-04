"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DOW = ["L", "M", "M", "J", "V", "S", "D"]; // lundi → dimanche

function parseValue(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function display(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}

function sameDay(a: Date | null, b: Date) {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Champ date au style du design system (popover calendrier custom, pas le picker natif). */
export default function DateField({
  label,
  value,
  onChange,
  required,
  align = "left",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  /** Côté d'ancrage du popover (évite le débordement quand le champ est à droite). */
  align?: "left" | "right";
}) {
  const selected = parseValue(value);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [view, setView] = useState<Date>(() => selected ?? new Date());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const POP_W = 280;

  function openPopover() {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) {
      const rawLeft = align === "right" ? r.right - POP_W : r.left;
      const left = Math.max(8, Math.min(rawLeft, window.innerWidth - POP_W - 8));
      setPos({ top: r.bottom + 8, left });
    }
    setOpen(true);
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1);
  // offset lundi-first : getDay() renvoie 0 (dim) → 6, 1 (lun) → 0…
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function pick(day: number) {
    onChange(toValue(new Date(year, month, day)));
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {label}
        {required && <span className="ml-0.5 text-accent-pink">*</span>}
      </label>

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (open ? setOpen(false) : openPopover())}
          className={`flex w-full items-center justify-between rounded-xl border bg-card-inner-bg px-4 py-2.5 text-left text-[length:var(--text-body)] font-light outline-none transition-all duration-200 ${
            open ? "border-accent-pink/50 bg-accent-pink/5" : "border-border-subtle hover:border-border-badge"
          }`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <span className={selected ? "text-text-primary" : "text-text-muted"}>
            {selected ? display(selected) : "Choisir une date"}
          </span>
          <svg className="h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </button>

        {open && pos && typeof document !== "undefined" && createPortal(
        <div
          ref={popRef}
          className="fixed z-[200] w-[280px] origin-top rounded-2xl border border-border-subtle bg-modal-bg p-4 shadow-[0px_16px_40px_-8px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          style={{ top: pos.top, left: pos.left, animation: "fade-up 180ms var(--ease-out) both" }}
        >
          {/* Month nav */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setView(new Date(year, month - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors duration-150 hover:bg-card-inner-bg hover:text-text-primary"
              aria-label="Mois précédent"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="text-[14px] font-medium text-text-primary">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setView(new Date(year, month + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors duration-150 hover:bg-card-inner-bg hover:text-text-primary"
              aria-label="Mois suivant"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {DOW.map((d, i) => (
              <span key={i} className="flex h-7 items-center justify-center text-[11px] font-medium text-text-muted">
                {d}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <span key={i} />;
              const d = new Date(year, month, day);
              const isSel = sameDay(selected, d);
              const isToday = sameDay(today, d);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(day)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] transition-colors duration-150 ${
                    isSel
                      ? "bg-accent-pink font-semibold text-white"
                      : `text-text-secondary hover:bg-card-inner-bg hover:text-text-primary ${isToday ? "font-semibold text-accent-pink" : ""}`
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
        )}
      </div>
    </div>
  );
}
