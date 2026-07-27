// État explicite pour un bloc/onglet dont les données réelles ne sont pas encore
// branchées à l'API. RÈGLE ABSOLUE : on n'affiche jamais de chiffre inventé —
// tant qu'un pilier n'est pas câblé (M3+), on l'annonce, on ne le simule pas.
export default function NotWiredNotice({ label }: { label?: string }) {
  return (
    <div className="animate-fade-up mx-auto max-w-2xl rounded-2xl border border-border-subtle bg-bg-card p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-card-inner-bg">
        <svg
          className="h-6 w-6 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-medium text-text-primary">
        Données en cours de câblage
      </h2>
      <p className="mx-auto max-w-md text-[14px] leading-relaxed text-text-muted">
        {label ?? "Ce contenu"} sera branché aux données réelles de l&apos;API,
        pilier par pilier. Aucun chiffre n&apos;est affiché tant que la donnée
        n&apos;est pas réelle — pas de valeur de démonstration.
      </p>
    </div>
  );
}
