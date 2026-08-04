interface BadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function Badge({ children, icon, className = "" }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-border-badge bg-bg-card px-4 py-[7px] ${className}`}
    >
      {icon && <span className="flex shrink-0 items-center text-text-secondary">{icon}</span>}
      <span className="text-[14px] font-normal text-text-secondary">{children}</span>
    </div>
  );
}
