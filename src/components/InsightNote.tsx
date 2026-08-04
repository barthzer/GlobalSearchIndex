/**
 * Encart « insight » rose : reprend le style de conseil déjà utilisé dans
 * NotorieteView / ConcurrenceView / ShareOfVoiceDonut (bordure + fond rose, icône « i »).
 * Centralisé ici pour rester cohérent sur tous les blocs.
 */
export default function InsightNote({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-accent-pink/15 bg-accent-pink/10 px-4 py-3 ${className}`}
    >
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M11.25 11.25h1.5v5.25M12 7.5h.008v.008H12V7.5Zm9.75 4.5a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
      </svg>
      <p className="text-[length:var(--text-body)] font-light leading-relaxed text-text-primary">{children}</p>
    </div>
  );
}
