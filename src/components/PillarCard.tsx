"use client";

interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  visual: React.ReactNode;
  index: number;
}

export default function PillarCard({ icon, title, description, visual, index }: PillarCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-card p-6 transition-all duration-300 hover:border-accent-purple/20 hover:bg-bg-card-hover md:p-8"
      style={{
        transitionTimingFunction: "var(--ease-out)",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Icon */}
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-white/[0.03] text-text-secondary">
        {icon}
      </div>

      {/* Text */}
      <h3 className="mb-2 text-lg font-semibold tracking-tight text-text-primary">
        {title}
      </h3>
      <p className="mb-6 text-sm leading-relaxed text-text-secondary">
        {description}
      </p>

      {/* Visual placeholder */}
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-white/[0.02]">
        {visual}
      </div>

      {/* Subtle glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.06) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
