"use client";

import { useEffect, useState } from "react";

interface Props {
  label: string;
  icon: React.ReactNode;
  delay?: number;
  children: React.ReactNode;
}

export default function NotorieteCard({ label, icon, delay = 0, children }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const animStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition:
      "opacity 600ms var(--ease-expo), transform 600ms var(--ease-expo), border-color 300ms var(--ease-out), background-color 300ms var(--ease-out)",
  };

  return (
    <div
      className="group relative flex min-h-[260px] flex-col items-center justify-between rounded-2xl border border-border-subtle bg-bg-card p-5 backdrop-blur-[6px] transition-all duration-300 hover:bg-bg-card-hover md:p-6"
      style={{ transitionTimingFunction: "var(--ease-out)", ...animStyle }}
    >
      {/* Header — exactement comme ScoreArc */}
      <div className="mb-4 flex w-full items-center gap-2">
        <span className="text-text-primary/80">{icon}</span>
        <span className="text-[length:var(--text-body-lg)] font-medium text-text-heading">
          {label}
        </span>
      </div>

      {children}
    </div>
  );
}
