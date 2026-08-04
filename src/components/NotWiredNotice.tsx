"use client";

/**
 * Encart honnête « donnée en cours de câblage / non disponible ».
 *
 * Affiché à la place d'un bloc dont la donnée réelle n'existe pas encore (onglet
 * non branché sur l'API, score absent, erreur de chargement). Le COMEX ne doit
 * jamais voir un vide silencieux NI un chiffre inventé : cet état DIT clairement
 * que la donnée n'est pas disponible. Langage visuel repris des états « non
 * disponible » existants (RealPageSpeed) : discret, jamais alarmant.
 */
export default function NotWiredNotice({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] md:p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-card-hover text-text-muted">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </span>
        <p className="text-[13px] font-medium text-text-secondary">Donnée non disponible</p>
      </div>
      {/* `label` porte le message métier complet (phrase ou intitulé du bloc) : on
          l'affiche tel quel, sans le compléter, pour rester juste dans les deux
          usages (onglet non câblé ET erreur de chargement). */}
      <p className="text-[13px] leading-relaxed text-text-muted">{label}</p>
    </div>
  );
}
