"use client";

import { useCredits } from "./CreditProvider";

/**
 * Indicateur de crédit freemium (réf. Grain "0/50 used on Free plan").
 * Affiche toujours la fraction restante/quota ("1/1", "0/1") pour que l'utilisateur
 * comprenne qu'il ne disposait que d'une seule analyse.
 * - Crédit dispo  → pill discrète "1/1 analyse gratuite".
 * - Crédit épuisé → pill cliquable "0/1 · Crédit utilisé" qui pousse vers le consultant.
 */
export default function CreditBadge({ onExhaustedClick }: { onExhaustedClick?: () => void }) {
  const { remaining, monthlyQuota, resetDate, canGenerate, ready } = useCredits();

  if (!ready) return null;

  const fraction = `${remaining}/${monthlyQuota}`;

  if (canGenerate) {
    return (
      <div
        className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border-subtle bg-card-inner-bg px-3 text-[13px] font-medium text-text-secondary"
        title={`${fraction} analyse gratuite ce mois`}
      >
        <svg className="h-3.5 w-3.5 text-accent-pink" viewBox="0 0 13 13" fill="currentColor">
          <path d="M6.5 0L8 4.5L13 6.5L8 8.5L6.5 13L5 8.5L0 6.5L5 4.5Z" />
        </svg>
        <span>
          <span className="text-text-primary">{fraction}</span> analyse gratuite
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onExhaustedClick}
      title={`Crédit renouvelé le ${resetDate}. Parlez à un consultant pour aller plus loin.`}
      className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border-subtle bg-card-inner-bg px-3 text-[13px] font-medium text-text-muted transition-all duration-200 hover:border-border-badge hover:text-text-secondary active:scale-[0.97]"
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
      <span><span className="text-text-secondary">{fraction}</span> · Crédit utilisé</span>
    </button>
  );
}
