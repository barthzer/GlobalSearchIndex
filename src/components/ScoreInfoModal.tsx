"use client";

import ModalPortal from "./ModalPortal";

interface Criterion {
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface ScoreInfo {
  title: string;
  heading: string;
  intro: string;
  criteria: Criterion[];
  conclusion: string;
}

interface ScoreInfoModalProps {
  info: ScoreInfo;
  icon?: React.ReactNode;
  onBack?: () => void;
  onClose: () => void;
}

export default function ScoreInfoModal({ info, icon, onBack, onClose }: ScoreInfoModalProps) {
  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
        onClick={onClose}
        style={{ animation: "fade-up 300ms var(--ease-expo) both" }}
      />

      <div
        className="relative w-full max-w-[520px] rounded-[2rem] border border-white/[0.06] bg-input-bg p-2"
        style={{ animation: "fade-up 400ms var(--ease-expo) both" }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-30"
          style={{
            background: "conic-gradient(from 220deg, transparent 50%, rgba(95,20,251,0.2) 70%, rgba(236,77,203,0.2) 85%, transparent 100%)",
          }}
        />

        <div className="relative max-h-[85vh] overflow-y-auto rounded-[calc(2rem-0.5rem)] border border-border-subtle bg-modal-bg p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-input-bg text-text-muted transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-text-primary active:scale-[0.95]"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary active:scale-[0.97]"
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Retour
            </button>
          )}

          {/* Header */}
          <div className="mb-6 mr-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-card-inner-bg px-3 py-1.5">
              {icon && <span className="text-text-primary/80">{icon}</span>}
              <span className="text-[length:var(--text-body)] font-medium text-text-heading">
                {info.title}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-text-primary">
              {info.heading}
            </h2>
            <p className="mt-3 text-[length:var(--text-body)] font-light leading-relaxed text-text-secondary">
              {info.intro}
            </p>
          </div>

          {/* Criteria */}
          <div className="flex flex-col gap-2">
            {info.criteria.map((criterion, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-card-inner-bg px-5 py-4"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-gradient-to-br from-[#6817F8]/15 to-[#EE56CE]/15 text-accent-pink">
                  {criterion.icon}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-[length:var(--text-body-lg)] font-medium text-text-primary">
                    {criterion.label}
                  </span>
                  <span className="text-[length:var(--text-body)] font-light leading-relaxed text-text-secondary">
                    {criterion.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Conclusion */}
          <div className="mt-5 rounded-xl border border-accent-pink/15 bg-gradient-to-br from-[#6817F8]/10 to-[#EE56CE]/10 px-4 py-3">
            <p className="text-[length:var(--text-body)] font-light leading-relaxed text-text-primary">
              {info.conclusion}
            </p>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
