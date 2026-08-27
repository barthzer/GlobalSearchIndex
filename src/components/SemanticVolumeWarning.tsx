"use client";

// Avertissement volume de recherche (pré-validation sémantique, NON bloquant).
// Faible (<20) → ambre « ~N rech./mois » ; inconnu (null/0) → rouge « volume introuvable ».
// Présentationnel pur : la décision (afficher / passer outre) vit dans SemanticUnlockModal.
// UX/wording final À FOURNIR PAR BARTH (Alexis fait l'UX des messages d'erreur) — placeholder.

export type VolumeWarning = { keyword: string; volume: number | null; level: string };

export default function SemanticVolumeWarning({ warnings }: { warnings: VolumeWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="mt-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-3.5 text-left">
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-amber-400">
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        Volume de recherche faible sur certains mots-clés
      </p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-text-secondary">
        Ces mots-clés sont peu (ou pas) recherchés — votre score sémantique risque d&apos;être peu
        représentatif. Ajustez-les, ou lancez quand même.
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {warnings.map((w) => (
          <li key={w.keyword} className="flex items-center justify-between gap-3 text-[12px]">
            <span className="truncate text-text-primary">{w.keyword}</span>
            <span className={`shrink-0 ${w.level === "unknown" ? "text-red-400" : "text-amber-400"}`}>
              {w.level === "unknown" ? "volume introuvable" : `~${w.volume} rech./mois`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
