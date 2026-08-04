"use client";

import { useEffect, useRef } from "react";

interface OtpInputProps {
  /** Nombre de cases (défaut 6). */
  length?: number;
  /** Valeur courante (chaîne de chiffres, sans trous). */
  value: string;
  onChange: (value: string) => void;
  /** Appelé quand les `length` chiffres sont saisis. */
  onComplete?: (value: string) => void;
  /** Affiche l'état d'erreur (cases rouges). */
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Champ de saisie de code à usage unique (OTP) : cases segmentées avec gestion
 * clavier complète (saisie, retour arrière, flèches), collage d'un code entier,
 * et auto-remplissage natif (one-time-code). Tous les états visuels sont gérés.
 */
export default function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const activeIdx = Math.min(value.length, length - 1);

  useEffect(() => {
    if (autoFocus && !disabled) refs.current[activeIdx]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus, disabled]);

  function commit(next: string): string {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    return clean;
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    const next = commit(value.slice(0, i) + raw + value.slice(i + raw.length));
    refs.current[Math.min(i + raw.length, length - 1)]?.focus();
    if (next.length === length) onComplete?.(next);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        commit(value.slice(0, i) + value.slice(i + 1));
        refs.current[i]?.focus();
      } else if (i > 0) {
        commit(value.slice(0, i - 1) + value.slice(i));
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!txt) return;
    const next = commit(txt);
    refs.current[Math.min(next.length, length - 1)]?.focus();
    if (next.length === length) onComplete?.(next);
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`Chiffre ${i + 1} sur ${length}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.currentTarget.select()}
          className={`h-14 w-11 rounded-xl border bg-input-bg text-center text-[22px] font-semibold tabular-nums text-text-primary outline-none transition-all duration-150 sm:w-12
            ${
              error
                ? "border-red-400/70 bg-red-500/[0.06] text-red-300"
                : d
                  ? "border-accent-pink/40"
                  : "border-border-subtle"
            }
            focus:border-accent-pink focus:ring-2 focus:ring-accent-pink/25
            ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        />
      ))}
    </div>
  );
}
